
window.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById("renderCanvas");
    const engine = new BABYLON.Engine(canvas, true);

    const scriptGUI = document.createElement("script");
    scriptGUI.id = "CASTORGUI";
    scriptGUI.src = "http://www.babylon.actifgames.com/demoCastorGUI/castorGUI.min.js";
    document.body.appendChild(scriptGUI);

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

    // pass a point and will land it on the planet
    const landPoint = function (p) {
        return BABYLON.Vector3.Normalize(p).scale(planetRadius);
    };

    const moveCharacter = function(character, speed, x, z) {
        character.rotation.y = Math.atan2(x, z);
        character.parent.rotate(new BABYLON.Vector3(z, 0, -x).normalize(), speed, BABYLON.Space.LOCAL);
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


        //charaterRoot is the inner basis in the sphere on which the charater moves
        const charaterRoot = new BABYLON.TransformNode("root");
        charaterRoot.rotation.x = -Math.PI / 2;

        const charaterRoot2 = new BABYLON.TransformNode("root2");
        charaterRoot2.rotation.x = -Math.PI / 2;

        const charater = new BABYLON.MeshBuilder.CreateSphere('charater', {diameter: 10}, scene);
        charater.parent = charaterRoot;
        charater.position.y = planetRadius;
        charater.material = new BABYLON.StandardMaterial('charaterMaterial', scene);
        charater.material.diffuseColor = new BABYLON.Color3(1,0,1);
        createAxis(20, scene).parent = charater;

        const charater2 = new BABYLON.MeshBuilder.CreateSphere('charater2', {diameter: 10}, scene);
        charater2.parent = charaterRoot;
        charater2.position = randomSpherePoint(new BABYLON.Vector3(0,1,0));
        charater2.material = new BABYLON.StandardMaterial('charaterMaterial', scene);
        charater2.material.diffuseColor = new BABYLON.Color3(0,0,1);

        camera.parent = charaterRoot;
        camera.setPosition(new BABYLON.Vector3(0,500,-50));



        // const assetsManager = new BABYLON.AssetsManager(scene);
        // const meshTask = assetsManager.addMeshTask("load_meshes", "", "meshes/crystal/", "crystal.babylon");
        // meshTask.onSuccess = function (task) {
        //     task.loadedMeshes[0].position = landPoint(new BABYLON.Vector3(1, 0, 0));
        //     task.loadedMeshes[0].scaling = new BABYLON.Vector3(5, 5, 5);
        //     task.loadedMeshes[0].rotation.x = -Math.PI/2;
        //     task.loadedMeshes[0].clone("sdfsd").position = landPoint(new BABYLON.Vector3(0, 1, 0));
        // };

        // const imageTask = assetsManager.addImageTask("image task", "textures/crystal/crystal.png");
        // imageTask.size =30;
        // imageTask.onSuccess = function(task) {
        //     console.log(task.image.width);
        // };
        // assetsManager.load();


        function randomSpherePoint(){
            let u = Math.random();
            let v = Math.random();
            let theta = 2 * Math.PI * u;
            let phi = Math.acos(2 * v - 1);
            let x = (planetRadius * Math.sin(phi) * Math.cos(theta));
            let y = (planetRadius * Math.sin(phi) * Math.sin(theta));
            let z = (planetRadius * Math.cos(phi));
            return new BABYLON.Vector3(x, y, z);
        }

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
        let meshTask = assetsManager.addMeshTask("load_meshes", "", "meshes/crystal/", "crystal.babylon");
        const resources = [];
        const resourceGenerator = function() {
            for(let i =0; i < resourceAmount; i++){

                meshTask.onSuccess = function (task) {
                    const resource = task.loadedMeshes[0];
                    resource.position = landPoint(new BABYLON.Vector3(1, 0, 0));
                    resource.scaling = new BABYLON.Vector3(5, 5, 5);
                    resource.rotation.x = -Math.PI/2;
                    resource.clone("sdfsd").position = landPoint(new BABYLON.Vector3(1, 1, 1));
                    resource.captured = false;
                    resource.material = new BABYLON.StandardMaterial("resourceMaterial", scene);
                    resource.position = randomSpherePoint();
                    resources.push(resource);
                };
                assetsManager.load();

            }
        };
        resourceGenerator();


        // const capturedResourceCount = function (){
        //     let capturedResources = 0;
        //     for(let i=0; i < resources.length; i++){
        //         if(resources[i].captured){
        //             capturedResources++;
        //         }
        //     }
        //     return capturedResources;
        // };

        const capturedResourceCount = function (){
            //if charater 1 intersects rescource and its captured 1 point for palyer
            let capturedResources = 0;
            for(let i=0; i < resources.length; i++){
                if(resources[i].captured){
                    capturedResources++;
                }
            }
            return capturedResources;
        };


        const board = BABYLON.Mesh.CreatePlane("board", 155, scene, false);
        board.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;
        board.material = new BABYLON.StandardMaterial("boardMaterial", scene);
        board.position = new BABYLON.Vector3(-100, 300, 100);
        board.scaling.y = 0.4;

        const boardTexture = new BABYLON.DynamicTexture("dynamic texture", 712, scene, true);
        board.material.diffuseTexture = boardTexture;
        board.material.specularColor = new BABYLON.Color3(0, 0, 0);
        board.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
        board.material.backFaceCulling = false;

        boardTexture.drawText("Player 1 Score:", null, 240, "bold 80px verdana", "white");
        boardTexture.hasAlpha = true;


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

            for (let i = 0; i < resources.length; i++) {
                if(!resources[i].captured){

                    if(charater.intersectsMesh(resources[i], false)) {
                        resources[i].captured = true;
                        player1Points++;
                        particleSystem.emitter = resources[i];
                        particleSystem.color1 = new BABYLON.Color4(0, 0, 1, .80);

                        document.getElementById('p1score').innerText = player1Points;
                        return player1Points;
                    }
                    if(charater2.intersectsMesh(resources[i], false)){
                        resources[i].captured = true;
                        player2Points++;
                        particleSystem.emitter = resources[i];
                        particleSystem.color1 = new BABYLON.Color4(1, 0, 0, .80);

                        document.getElementById('p2score').innerText = player2Points;
                        return player2Points;
                    }
                    let leftOver =  resources.length - player1Points + player2Points;
                    document.getElementById('leftOver').innerText = leftOver;
                }
            }

        });

        scene.registerAfterRender(function () {
            // let player1score = capturedResourceCount();
            // const context2D = boardTexture.getContext();

            // const char1score = function() {
            //     context2D.clearRect(0, 850, 400, 400);
            //     boardTexture.drawText(player1score, null, 480, "140px verdana", "white", null);
            // };
            // char1score();
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
                moveCharacter(charater2, speed, hor, ver);
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
                // let count = capturedResourceCount();
                // console.log("Captured =", count, "/", resources.length);
                console.log("Player 1:", player1Points, "Player 2:", player2Points,"/", resources.length);

            }

            if (map["Shift"]) {
                speed *= 10;
            }
            if (hor !== 0 || ver !== 0) {
                moveCharacter(charater, speed, hor, ver);
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

