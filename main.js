// Nasa api key: 9tXxbDNvlaAMtlAzBqiQXg6MRl5kOwXyGOCyS3Vz

window.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById("renderCanvas");
    const engine = new BABYLON.Engine(canvas, true);


    const createScene = function () {
        const scene = new BABYLON.Scene(engine);
        scene.enablePhysics();

        //(x,y,z)
        const camera = new BABYLON.ArcRotateCamera("Camera", 0,canvas.height / 2, 10, BABYLON.Vector3.Zero(), scene);
        // camera.setTarget(BABYLON.Vector3.Zero());
        camera.setPosition(new BABYLON.Vector3(0, 30, -150));
        camera.attachControl(canvas, false);

        //DON'T LOOK BEYOND GROUND
        camera.lowerBetaLimit = 0.1;
        //TODO look up to half canvas hieght only
        camera.upperBetaLimit = canvas.height / 2;
        // camera.lowerRadiusLimit = 150;

        // const light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 0, -7), scene);

        // const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0.1, 0, 0), scene);
        // light.diffuse = new BABYLON.Color3(0, 0, 0);

        const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', {diameter: 20}, scene);
        sphere.position.y = 10;

        const sphereMaterial = new BABYLON.StandardMaterial("material", scene);
        sphereMaterial.ambientColor = new BABYLON.Color3(0, .60, .58);
        sphere.material = sphereMaterial;

        const light = new BABYLON.PointLight("light", new BABYLON.Vector3(sphere.position.x, sphere.position.y, sphere.position.z), scene);
        light.intensity = 1.5;

        const skybox = BABYLON.Mesh.CreateBox("skyBox", 1000.0, scene);
        const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("skybox/skybox", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 1);
        skybox.material = skyboxMaterial;

        const ground = BABYLON.Mesh.CreateGround("ground", 1000, 1000, 1, scene, false);
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);

        //specular texture is black and white - the light will highlight more on the white part of img
        groundMaterial.diffuseTexture = new BABYLON.Texture("ground.jpg", scene);
        //emmissive texture maps areas where img emmits light - doesnt effect ground or light much but would be used for lamps
        groundMaterial.specularTexture = new BABYLON.Texture("ground_SPEC.png", scene);
        //bump texture adds normal img texture
        groundMaterial.bumpTexture = new BABYLON.Texture("ground_NRM.png", scene);

        groundMaterial.diffuseTexture.uScale = 60;
        groundMaterial.diffuseTexture.vScale = 60;
        groundMaterial.specularTexture.uScale = 60;
        groundMaterial.specularTexture.vScale = 60;
        groundMaterial.bumpTexture.uScale = 60;
        groundMaterial.bumpTexture.vScale = 60;

        ground.material = groundMaterial;


        //const sphere = BABYLON.Mesh.CreateBox("skyBox", 10.0, scene);


        const box = BABYLON.MeshBuilder.CreateBox("box", {height: 25, width: 35}, scene);
        box.material = skyboxMaterial;
        box.position.x = -30;
        box.position.y = 10;

        // CreateCylinder("name", height, top-cone, bottom-cone, edges, diameter)
        const cylinder = BABYLON.Mesh.CreateCylinder("cylinder", 10, 20, 20, 22, 2, scene);
        // Vector3(x,y,z) -> positions
        cylinder.position = new BABYLON.Vector3(30, 10, 4);

        const cylinderMaterial = new BABYLON.StandardMaterial("material", scene);
        cylinderMaterial.emissiveColor = new BABYLON.Color3(1, 0.78, 0.4);
        cylinder.material = cylinderMaterial;



        // const water = BABYLON.Mesh.CreateGround("water", 1000, 1000, 1, scene, false);

        let map = {}; //object for multiple key presses
        scene.actionManager = new BABYLON.ActionManager(scene);

        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
            map[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
        }));

        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
            map[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
        }));

        scene.registerAfterRender(function () {
            // -----MOVE-----(can use two keys at once to move diagonally)
            if ((map["w"] || map["W"])) {
                //forward
                sphere.position.z += 1;
                light.position.z += 1;
            }

            if ((map["s"] || map["S"])) {
                //back
                sphere.position.z -= 1;
                light.position.z -= 1;
            }

            if ((map["a"] || map["A"])) {
                //left
                sphere.position.x -= 1;
                light.position.x -= 1;
            }

            if ((map["d"] || map["D"])) {
                //right
                sphere.position.x += 1;
                light.position.x += 1;
            }
            if(map[" "]){
                console.log("spacebar");
                sphere.position.y += 3;
                light.position.y += 1;
            }
        });

        sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.9 }, scene);

        ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);

        sphere.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(1, 0, 1));


        scene.onPointerDown = function (evt, pickResult) {
            const cylinder = scene.getMeshByName("cylinder");
            const sphere = scene.getMeshByName("sphere");
            if (evt.hit) {
                cylinder.position.x = evt.sphere.x;
                cylinder.position.y = evt.sphere.y;
                console.log("hit");
                cylinder.ambientColor = new BABYLON.Color3(1, 1, 1);
            }
        };


        return scene;
    };
    const scene = createScene();

    let t = 0;
    const renderLoop = function () {
        scene.render();
        t -= 0.012;
        // const material = scene.getMeshByName("sphere").material;
        // material.alpha -= 0.002;
        // if(material.alpha <= 0) material.alpha = 1;
        const sphere = scene.getMeshByName("sphere");
        sphere.rotate(BABYLON.Axis.Z, 0.1);

        const cylinder = scene.getMeshByName("cylinder");
        cylinder.position.y = Math.sin(t*3);

    };
    engine.runRenderLoop(renderLoop);

    // engine.runRenderLoop(function () { // animation loop 60fps
    //     scene.render();
    // });

    window.addEventListener("resize", function () { // for smooth resizing
        engine.resize();
    });
});

