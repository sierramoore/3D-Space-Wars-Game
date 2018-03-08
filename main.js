
window.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById("renderCanvas");
    const engine = new BABYLON.Engine(canvas, true);

    // const scriptGUI = document.createElement("script");
    // scriptGUI.id = "CASTORGUI";
    // scriptGUI.src = "http://www.babylon.actifgames.com/demoCastorGUI/castorGUI.min.js";
    // document.body.appendChild(scriptGUI);

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


    const planetRadius = 150;
    const resourceAmount = 12;
    const playerCount = 2;

    const moveCharacter = function(character, speed, x, z) {
        character.rotation.y = Math.atan2(x, z);
        character.parent.rotate(new BABYLON.Vector3(z, 0, -x).normalize(), speed, BABYLON.Space.LOCAL);
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

    function randomPlanetPoint() {
        return randomSpherePoint(planetRadius);
    }

    const createResources = function(count, scene, assetsManager) {
        const resources = [];
        let meshTask = assetsManager.addMeshTask("load_meshes", "", "meshes/crystal/", "crystal.babylon");
        meshTask.onSuccess = function (task) {
            const crystal = task.loadedMeshes[0];
            crystal.position = landPoint(new BABYLON.Vector3(0, 0, 0));
            crystal.scaling = new BABYLON.Vector3(5, 5, 5);

            for (let i = 0; i < count; i++) {
                const n = randomSpherePoint();
                const resource = crystal.clone("resource_" + i);
                //createAxis(100,scene).parent = resource;
                resource.position = n.scale(planetRadius);

                const rx = new BABYLON.Vector3(0, 1, 0);
                const ry = new BABYLON.Vector3(1, 0, 0);
                const rz = new BABYLON.Vector3(0, 0, 1);
                // resource.rotation.x = 1;
                // resource.rotation.y = 2;
                //const r = Vector3.RotationFromAxis(rx, ry, rz);
                //console.log(i, r);
                //resource.rotation = Vector3.RotationFromAxis(rx, ry, rz);
                //console.log(i, resource.position, resource.rotation);
                //resource.rotationQuaternion = Quaternion.RotationQuaternionFromAxis(rx, ry, rz);
                //resource.rotation.x = -Math.PI / 2;
                resource.capturedBy = null;
                resources.push(resource);
            }

           crystal.dispose();
        };
        return resources;
    };

    const createCharacters = function (colors, scene) {
        const characters = [];

        for (let i = 0; i < colors.length; i++) {
            //charaterRoot is the inner basis in the sphere on which the charater moves
            const charaterRoot = new BABYLON.TransformNode("root");
            charaterRoot.rotation.x = -Math.PI / 2;

            const charater = new BABYLON.MeshBuilder.CreateSphere('charater', {diameter: 10}, scene);
            createAxis(20, scene).parent = charater;
            charater.parent = charaterRoot;
            charater.position.y = planetRadius;
            charater.material = new BABYLON.StandardMaterial('charaterMaterial_' + i, scene);
            charater.material.diffuseColor = colors[i];

            charater.logic = { score:0, color:colors[i] };

            characters.push(charater);
        }
        return characters;
    };


    const createScene = function () {
        const scene = new BABYLON.Scene(engine);
        // scene.enablePhysics();

        const camera = new BABYLON.ArcRotateCamera("Camera", 0, canvas.height/2, 10, BABYLON.Vector3.Zero(), scene);
        //camera.setPosition(new BABYLON.Vector3(0,500,100));
        camera.attachControl(canvas, false);
        camera.lowerRadiusLimit = 150;

        const skybox = BABYLON.Mesh.CreateBox("skybox", 10000.0, scene);
        const skyboxMaterial = new BABYLON.StandardMaterial("skybox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox/sky", scene, ["_px.png", "_py.png", "_pz.png", "_nx.png","_ny.png", "_nz.png"]);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;

        const planet = BABYLON.MeshBuilder.CreateSphere('sphere', {diameter: planetRadius * 2}, scene);
        createAxis(200, scene).parent = planet;
        planet.rotation.y = -2;
        const planetMtl = new BABYLON.StandardMaterial("planet", scene);
        planetMtl.diffuseTexture = new BABYLON.Texture("textures/planet/moon.jpg", scene);
        planetMtl.bumpTexture = new BABYLON.Texture("textures/planet/moon_NRM.png", scene);
        planetMtl.specularTexture = new BABYLON.Texture("textures/planet/moon_SPEC.png", scene);
        planet.material = planetMtl;

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

        const characters = createCharacters([new BABYLON.Color3(1,0,1), new BABYLON.Color3(0,0,1)], scene);

        camera.parent = characters[0].parent;
        camera.setPosition(new BABYLON.Vector3(0,500,-50));

        const particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
        particleSystem.particleTexture = new BABYLON.Texture("textures/flare.png", scene);
        // particleSystem.textureMask = new BABYLON.Color4(0.1, 0.8, 0.8, 1.0);
        particleSystem.emitter = landPoint(new BABYLON.Vector3(0,0,0));
        particleSystem.start();
        particleSystem.minSize = 5;
        particleSystem.maxHeight = 2;
        particleSystem.emitRate = 500;
        particleSystem.minEmitPower = 5;
        particleSystem.maxEmitPower = 50;
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;


        const assetsManager = new BABYLON.AssetsManager(scene);
        const resources = createResources(resourceAmount, scene, assetsManager);
        assetsManager.load();

        let map = {}; //object for multiple key presses
        scene.actionManager = new BABYLON.ActionManager(scene);
        // scene.fogEnabled = true;
        // scene.fogColor = new BABYLON.Color3(1., 0., 0.);
        // scene.fogDensity = 10;
        // scene.fogDensity = 10;

        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
            map[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
        }));

        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
            map[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
        }));


        let player1Points = 0;
        let player2Points = 0;
        scene.registerAfterRender(function () {
            //TODO make particle effect last for caught rescource
            for (let i = 0; i < resources.length; i++) {
                for (let j = 0; j < characters.length; j++) {
                    const character = characters[j];
                    if (resources[i].contact !== character && character.intersectsMesh(resources[i], false)) {
                        if (resources[i].capturedBy !== null) {
                            --resources[i].capturedBy.logic.score;
                        }
                        resources[i].capturedBy = character;
                        ++character.logic.score;

                        particleSystem.emitter = resources[i];
                        particleSystem.color1 = character.logic.color;
                    }
                }
            }

            // document.getElementById('p1score').innerText = player1Points;
            // document.getElementById('leftOver').innerText = resources.length - player1Points + player2Points;

        });

        scene.registerAfterRender(function () {
            let speed = 0.01;
            let hor = 0;
            let ver = 0;

            //forward
            if ((map["i"] || map["I"])) {
                ver += 1;
            }

            //back
            if ((map["k"] || map["K"])) {
                ver += -1;
            }

            //left
            if ((map["j"] || map["J"])) {
                hor += -1;
            }

            //right
            if ((map["l"] || map["L"])) {
                hor += 1;
            }

            if (hor !== 0 || ver !== 0) {
                moveCharacter(characters[1], speed, hor, ver);
            }
        });


        scene.registerAfterRender(function () {
            // sets skybox to camera so u cant zoom past skybox
            skybox.position = camera.position;
            // -----MOVE-----(can use two keys at once to move diagonally)
            let speed = 0.01;
            let hor = 0;
            let ver = 0;


            //forward
            if ((map["w"] || map["W"])) {
                ver += 1;
            }

            //back
            if ((map["s"] || map["S"])) {
                ver += -1;
            }

            //left
            if ((map["a"] || map["A"])) {
                hor += -1;
            }

            //right
            if ((map["d"] || map["D"])) {
                hor += 1;
            }

            //jump
            if (map[" "]) {
                console.log("Player 1:", player1Points, "Player 2:", player2Points,"/", resources.length);
            }

            if (map["Shift"]) {
                speed *= 5;
            }
            if (hor !== 0 || ver !== 0) {
                moveCharacter(characters[0], speed, hor, ver);
            }
        });


        return scene;
    };
    const scene = createScene();

    window.focus();
    engine.runRenderLoop(() => {
        scene.render();
    });

    window.addEventListener("resize", function () { // for smooth resizing
        engine.resize();
    });
});

