window.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById("renderCanvas");
    const engine = new BABYLON.Engine(canvas, true);


    const createScene = function () {
        const scene = new BABYLON.Scene(engine);
        scene.enablePhysics();

        const camera = new BABYLON.ArcRotateCamera("Camera", 0,canvas.height / 2, 10, BABYLON.Vector3.Zero(), scene);
        camera.setPosition(new BABYLON.Vector3(0, 0, -500));
        camera.attachControl(canvas, false);
        camera.lowerBetaLimit = 0.1;
        camera.upperBetaLimit = canvas.height / 2;
        camera.lowerRadiusLimit = 150;


        const skybox = BABYLON.Mesh.CreateBox("skybox", 10000.0, scene);
        const skyboxMaterial = new BABYLON.StandardMaterial("skybox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox/sky", scene, ["_px.png", "_py.png", "_pz.png", "_nx.png","_ny.png", "_nz.png"]);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;

        const planet = BABYLON.MeshBuilder.CreateSphere('sphere', {diameter: 300}, scene);
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

        let map = {}; //object for multiple key presses
        scene.actionManager = new BABYLON.ActionManager(scene);

        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
            map[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
        }));

        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
            map[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
        }));



        scene.registerAfterRender(function () {
            skybox.position = camera.position;
            // -----MOVE-----(can use two keys at once to move diagonally)

            if ((map["w"] || map["W"])) {
                //forward
                trumpWalk.position.z += 1;
                trumpWalk.invertU = -1;
                trumpWalk.playAnimation(0, 9, true, 110);
                light.position.z += 1;
            }

            if ((map["s"] || map["S"])) {
                //back
                trumpWalk.position.z -= 1;
                trumpWalk.playAnimation(0, 9, true, 110);
                light.position.z -= 1;
            }

            if ((map["a"] || map["A"])) {
                //left
                trumpWalk.position.x -= 1;
                trumpWalk.invertU = -1;
                trumpWalk.playAnimation(10, 16, true, 110);
                light.position.x -= 1;
            }

            if ((map["d"] || map["D"])) {
                //right
                trumpWalk.position.x += 1;
                light.position.x += 1;
                trumpWalk.invertU = 0;
                trumpWalk.playAnimation(10, 16, true, 110);
            }
            if (map[" "]) {
                console.log("spacebar");
                trumpWalk.position.y += 3;
                trumpWalk.playAnimation(0, 9, true, 110);
                light.position.y += 1;
            }

        });


        return scene;
    };
    const scene = createScene();

    const renderLoop = function () {
        scene.render();
    };
    engine.runRenderLoop(renderLoop);


    window.addEventListener("resize", function () { // for smooth resizing
        engine.resize();
    });
});

