let startGameIfLoaded;

window.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById("renderCanvas");
    const engine = new BABYLON.Engine(canvas, true);

    window.addEventListener("resize", function () { // for smooth resizing
        engine.resize();
    });

    /////////// debug visuals --axis lines
    const createAxe = function (x, y, z, size, scene) {
        const axe = BABYLON.Mesh.CreateLines("axisX", [
            new BABYLON.Vector3.Zero(),
            new BABYLON.Vector3(size*x, size*y, size*z)
        ], scene);
        axe.color = new BABYLON.Color3(x, y, z);
        return axe;
    };

    const createAxis = function (size, scene) {
        const node = new BABYLON.TransformNode("root");
        createAxe(1, 0, 0, size, scene).parent = node;
        createAxe(0, 1, 0, size, scene).parent = node;
        createAxe(0, 0, 1, size, scene).parent = node;
        return node;
    };
    //////////////////////


    const gameStateMenu = 0;
    const gameStatePlay = 1;
    const gameStateOver = 2;
    const planetRadius = 150;
    const resourceAmount = 1;
    const playerCount = 2;


    const moveCharacter = function(character, speed, x, z) {
        character.rotation.y = Math.atan2(x, z);
        character.parent.rotate(new BABYLON.Vector3(z, 0, -x).normalize(), speed, BABYLON.Space.LOCAL);
    };

    const distanceSqr = function(obj1, obj2) {
        return obj1.getAbsolutePosition().subtract(obj2.getAbsolutePosition()).lengthSquared();
    };

    const canCapture = function(character, resource) {
        return 300 >= distanceSqr(character, resource);
    };

    const canSee = function(character, resource) {
        return true;
        //return 20000 >= distanceSqr(character, resource);
    };

    // pass a point and will land it on the planet
    const landPoint = function (p) {
        return BABYLON.Vector3.Normalize(p).scale(planetRadius);
    };

    function randomSpherePoint(radius){
        if (radius === undefined) {
            radius = 1;
        }
        let u = Math.random();
        let v = Math.random();
        let theta = 2 * Math.PI * u;
        let phi = Math.acos(2 * v - 1);
        let x = (radius * Math.sin(phi) * Math.cos(theta));
        let y = (radius * Math.sin(phi) * Math.sin(theta));
        let z = (radius * Math.cos(phi));
        return new BABYLON.Vector3(x, y, z);
    }

    function randomSphereOrientation(){
        let u = Math.random();
        let v = Math.random();
        let theta = 2 * Math.PI * u;
        let phi = Math.acos(2 * v - 1);
        return new BABYLON.Vector3(phi, theta, 0);
    }

    function randomPlanetPoint() {
        return randomSpherePoint(planetRadius);
    }

    const loadResources = function(count, assetsManager, game) {
        let meshTask = assetsManager.addMeshTask("load_meshes", "", "meshes/crystal/", "crystal.babylon");
        meshTask.onSuccess = function (task) {
            const resources = [];

            const particleSystem = new BABYLON.ParticleSystem("particles", 2000, game.scene);
            particleSystem.particleTexture = new BABYLON.Texture("textures/flare.png", game.scene);
            particleSystem.emitter = landPoint(new BABYLON.Vector3(0,0,0));
            particleSystem.stop();
            particleSystem.minSize = 5;
            particleSystem.maxHeight = 2;
            particleSystem.emitRate = 100;
            particleSystem.minEmitPower = 5;
            particleSystem.maxEmitPower = 50;
            particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

            const crystal = task.loadedMeshes[0];
            crystal.scaling = new BABYLON.Vector3(5, 5, 5);

            for (let i = 0; i < count; i++) {
                const root = new BABYLON.TransformNode("root");

                const resource = crystal.clone("resource_" + i);
                //createAxis(100, game.scene).parent = resource;
                resource.parent = root;

                resource.particleSystem = particleSystem.clone("", resource);
                resource.particleSystem.stop();

                resource.setEnabled(false);
                resource.capturedBy = null;
                resources.push(resource);
            }
            particleSystem.dispose();
            crystal.dispose();

            game.resources = resources;
            onGameAssetsLoaded(game);
        };
    };
    
    const loadCharacters = function (attributes, assetsManager, game) {
        //guarantees the space in which the character will be loaded
        game.characters = [];
        game.characters.length = attributes.length;

        for(let i=0; i < attributes.length; i++){
            let meshTask = assetsManager.addMeshTask("load_meshes", "", "meshes/" + attributes[i].model + "/", attributes[i].model + ".babylon");
            meshTask.onSuccess = function (task) {
                const characterRoot = new BABYLON.TransformNode("root");
                characterRoot.rotation.x = -Math.PI / 2;

                const character = new BABYLON.MeshBuilder.CreateSphere('charater', {diameter: .1}, game.scene);
                character.parent = characterRoot;
                character.position.y = planetRadius;

                const model = task.loadedMeshes[0];
                model.setPivotPoint(attributes[i].pivot, BABYLON.Space.LOCAL);
                model.scaling = new BABYLON.Vector3(attributes[i].scale, attributes[i].scale, attributes[i].scale);
                model.parent = character;
                model.rotation.y = Math.PI;

                character.logic = {score: 0, color: attributes[i].color, name: "Player " + (i + 1)};
                game.characters[i] = character;

                onGameAssetsLoaded(game);
            };
        }
    };

    const isAllGameAssetsLoaded = function(game) {
        if (game.resources === null)
            return false;

        for (let i = 0; i < game.characters.length; ++i) {
            if (game.characters[i] === undefined)
                return false;
        }

        return true;
    };

    const onGameAssetsLoaded = function(game) {
        if (isAllGameAssetsLoaded(game)) {
            game.loaded = true;
        }
    };

    const startGame = function(game) {
        if (game.loaded && game.state !== gameStatePlay) {
            const characters = game.characters;
            const resources = game.resources;

            for(let i=0; i < characters.length; i++) {
                const character = characters[i];
                character.parent.rotation.x = -Math.PI / 2;
                character.parent.rotation.y = Math.PI/4 * i;
                character.parent.rotation.z = 0;

                character.logic.score = 0;
            }

            for(let i=0; i < resources.length; i++) {
                const resource = resources[i];
                resource.setEnabled(false);
                resource.particleSystem.stop();

                resource.parent.rotation = randomSphereOrientation();

                resource.position.x = 0;
                resource.position.z = 0;
                resource.position.y = planetRadius;

                resource.capturedBy = null;
            }

            game.camera.setTarget(game.planet);
            //game.camera.setPosition(new BABYLON.Vector3(0,500,-50));

            document.getElementById("winner").innerText = "";
            document.getElementById("gameOver").innerText = "";
            document.getElementById("playAgain").innerText = "";
            game.state = gameStatePlay
        }
    };

    const stopGame = function (game) {
        if (game.state === gameStatePlay) {
            game.state = gameStateOver;

            let winner = null;

            for(let i=0; i < game.characters.length; i++) {
                if (winner === null) {
                    winner = game.characters[i];
                } else if (winner.logic.score < game.characters[i].logic.score) {
                    winner = game.characters[i];
                }
                // TODO tie
            }

            document.getElementById("gameOver").innerText = "Game Over";
            document.getElementById("winner").innerText = winner.logic.name + " Wins";
            document.getElementById("playAgain").innerText = "Press Space Bar To Play Again";
        }
    };

    const handleCharacterInput = function (character, left, right, up, down, accel) {
        let speed = 0.01;
        let hor = 0;
        let ver = 0;

        if (up) {
            ver += 1;
        }
        if (down) {
            ver += -1;
        }
        if (left) {
            hor += -1;
        }
        if (right) {
            hor += 1;
        }
        if (accel) {
            speed *= 5;
        }

        if (hor !== 0 || ver !== 0) {
            moveCharacter(character, speed, hor, ver);
        }
    };

    const handleGameInput = function (game, map) {
        if (game.state === gameStatePlay) {
            handleCharacterInput(game.characters[0],
                map["a"]||map["A"], map["d"]||map["D"], map["w"]||map["W"], map["s"]||map["S"], map["Shift"]);
            handleCharacterInput(game.characters[1],
                map["j"]||map["J"], map["l"]||map["L"], map["i"]||map["I"], map["k"]||map["K"], map["Shift"]);
        } else if (game.state === gameStateOver) {
            if (map[" "]) {
                startGame(game);
            }
        }
    };

    const runGame = function (game) {
        // sets skybox to camera so u cant zoom past skybox
        game.skybox.position = game.camera.position;

        if (game.state === gameStatePlay) {
            const characters = game.characters;
            const resources = game.resources;

            for (let i = 0; i < resources.length; i++) {
                for (let j = 0; j < characters.length; j++) {
                    const character = characters[j];
                    if (!resources[i].isEnabled(false) && canSee(character, resources[i])) {
                        resources[i].setEnabled(true);
                    }

                    if (resources[i].contact !== character && canCapture(character, resources[i])) {
                        if (resources[i].capturedBy !== null) {
                            --resources[i].capturedBy.logic.score;
                        }
                        resources[i].capturedBy = character;
                        ++character.logic.score;

                        resources[i].particleSystem.color1 = character.logic.color;
                        resources[i].particleSystem.start();
                    }
                }
            }

            let scoreSum = 0;

            for(let i=0; i < characters.length; i++) {
                scoreSum += characters[i].logic.score;
                document.getElementById('p' + i + 'score').innerText = characters[i].logic.score;
            }

            if (scoreSum === resourceAmount) {
               stopGame(game);
            }
            
            document.getElementById('leftOver').innerText = resources.length - scoreSum;
        }
    };

    const createGame = function() {
        const scene = new BABYLON.Scene(engine);

        // const startCamera = new BABYLON.ArcRotateCamera("startCamera",  0, canvas.height * 2, 10, BABYLON.Vector3.Zero(), scene);
        // startCamera.attachControl(canvas, false);


        const camera = new BABYLON.ArcRotateCamera("Camera", 0, canvas.height/2, 10, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, false);
        camera.lowerRadiusLimit = 150;
        camera.useFramingBehavior = true;

        const skybox = BABYLON.Mesh.CreateBox("skybox", 10000.0, scene);
        const skyboxMaterial = new BABYLON.StandardMaterial("skybox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox/sky", scene, ["_px.png", "_py.png", "_pz.png", "_nx.png","_ny.png", "_nz.png"]);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;

        const planet = BABYLON.MeshBuilder.CreateSphere('sphere', {diameter: planetRadius * 2}, scene);
        // createAxis(200, scene).parent = planet;
        planet.rotation.y = -2;
        const planetMtl = new BABYLON.StandardMaterial("planet", scene);
        planetMtl.diffuseTexture = new BABYLON.Texture("textures/planet/moon.jpg", scene);
        planetMtl.bumpTexture = new BABYLON.Texture("textures/planet/moon_NRM.png", scene);
        planetMtl.specularTexture = new BABYLON.Texture("textures/planet/moon_SPEC.png", scene);
        planet.material = planetMtl;

        camera.setTarget(skybox);
        camera.lowerRadiusLimit = 350;
        camera.upperRadiusLimit = 5000;

        const ambientLight = new BABYLON.HemisphericLight('ambient light bob', new BABYLON.Vector3(0,0,0), scene);
        ambientLight.excludedMeshes.push(skybox); //push light into the excludeMeshes arr to be excluded so it doesnt over light scene
        ambientLight.setDirectionToTarget(new BABYLON.Vector3(0,0,0));
        ambientLight.diffuse = new BABYLON.Color3(0.2, 0.2, 0.3);
        ambientLight.specular = new BABYLON.Color3(0, 0, 0);
        ambientLight.intensity = 6;



        const directionalLight1 = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(600, 0, 600), scene);
        directionalLight1.excludedMeshes.push(skybox);
        directionalLight1.diffuse = new BABYLON.Color3(1, 1, 1);
        directionalLight1.specular = new BABYLON.Color3(0.2, 0.2, 0.3);
        directionalLight1.intensity = 1.5;


        const game = { state: gameStateMenu, loaded: false, scene: scene, camera: camera, skybox: skybox, planet: planet, characters: null, resources: null };

        const assetsManager = new BABYLON.AssetsManager(scene);
        const attributes = [
            {
                model: "queen",
                color: new BABYLON.Color3(1, 0, 0),
                scale: 10,
                pivot: new BABYLON.Vector3(0, 0, 0)
            },
            {
                model: "trump",
                color: new BABYLON.Color3(0, 0, 1),
                scale: 20,
                pivot: new BABYLON.Vector3(-0.24, 0, 0)
            }
        ];

        loadCharacters(attributes, assetsManager, game);
        loadResources(resourceAmount, assetsManager, game);
        assetsManager.load();

        let keymap = {}; //object for multiple key presses
        game.scene.actionManager = new BABYLON.ActionManager(game.scene);
        game.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
            keymap[evt.sourceEvent.key] = true;
        }));
        game.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
            keymap[evt.sourceEvent.key] = false;
        }));

        game.scene.registerAfterRender(() => { handleGameInput(game, keymap) });
        game.scene.registerAfterRender(() => { runGame(game) });

        return game;
    };

    const game = createGame();

    startGameIfLoaded = function(){
        startGame(game);
    };

    engine.runRenderLoop(() => {
        //render after click a start button
        game.scene.render();
    });
});

