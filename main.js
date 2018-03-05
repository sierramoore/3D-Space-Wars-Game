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
        camera.setPosition(new BABYLON.Vector3(0, 100, -400));
        camera.attachControl(canvas, false);

        //DON'T LOOK BEYOND GROUND
        camera.lowerBetaLimit = 0.1;
        //TODO look up to half canvas hieght only
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
        const marsTexture = new BABYLON.Texture("textures/planet/mars.jpg", scene);
        const marsMaterial = new BABYLON.StandardMaterial("marsMaterial", scene);
        marsMaterial.diffuseTexture = marsTexture;
        marsMaterial.bumpTexture = new BABYLON.Texture("textures/planet/mars_NRM.png", scene);
        marsMaterial.specularTexture = new BABYLON.Texture("textures/planet/mars_SPEC.png", scene);
        planet.material = marsMaterial;

        const ambientLight = new BABYLON.HemisphericLight('ambient light bob', new BABYLON.Vector3(0,0,0), scene);
        ambientLight.excludedMeshes.push(skybox); //push light into the excludeMeshes arr to be excluded so it doesnt over light scene
        ambientLight.setDirectionToTarget(new BABYLON.Vector3(0,0,0));
        ambientLight.diffuse = new BABYLON.Color3(0.7, 0.4, 0.4);
        ambientLight.specular = new BABYLON.Color3(0, 0, 0);
        ambientLight.intensity = 1.5;

        const directionalLight1 = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(600, 0, 600), scene);
        directionalLight1.excludedMeshes.push(skybox);
        directionalLight1.diffuse = new BABYLON.Color3(1, 1, 1);
        directionalLight1.specular = new BABYLON.Color3(0.3, 0.3, 0.3);

        // const directionalLight2 = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(-600, 0, 600), scene);
        // directionalLight2.diffuse = new BABYLON.Color3(0.2, 0.2, 0.6);
        // directionalLight2.specular = new BABYLON.Color3(0, 0, 0);

        // const light = new BABYLON.PointLight("light", new BABYLON.Vector3(trumpWalk.position.x, trumpWalk.position.y, trumpWalk.position.z), scene);
        // light.diffuse = new BABYLON.Color3(1, 1, 1);
        // light.specular = new BABYLON.Color3(1, 1, 1);



        let spriteManagerTrumpWalk = new BABYLON.SpriteManager("trumpManagerWalk", "sprites/trump_walk.png", 4, 256, scene);
        let trumpWalk = new BABYLON.Sprite("trumpWalk", spriteManagerTrumpWalk);
        trumpWalk.position.y = 15;
        trumpWalk.position.z = -300;
        trumpWalk.size = 30;

        // const ground = BABYLON.Mesh.CreateGround("ground", 1000, 1000, 1, scene, false);
        // const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        //
        // //specular texture is black and white - the light will highlight more on the white part of img
        // groundMaterial.diffuseTexture = new BABYLON.Texture("ground.jpg", scene);
        // //emmissive texture maps areas where img emmits light - doesnt effect ground or light much but would be used for lamps
        // groundMaterial.specularTexture = new BABYLON.Texture("ground_SPEC.png", scene);
        // //bump texture adds normal img texture
        // groundMaterial.bumpTexture = new BABYLON.Texture("ground_NRM.png", scene);
        //
        // groundMaterial.diffuseTexture.uScale = 60;
        // groundMaterial.diffuseTexture.vScale = 60;
        // groundMaterial.specularTexture.uScale = 60;
        // groundMaterial.specularTexture.vScale = 60;
        // groundMaterial.bumpTexture.uScale = 60;
        // groundMaterial.bumpTexture.vScale = 60;
        //
        // ground.material = groundMaterial;
        //
        // const groundPlane = BABYLON.Mesh.CreatePlane("groundPlane", 200.0, scene);
        // groundPlane.material = groundMaterial;

        // params for CreateGroundFromHeightMap(name, url, size of mesh, width, height, num of divisions, min height, max height, scene, updateable, successCallback)
        // const ground2 = BABYLON.Mesh.CreateGroundFromHeightMap("ground2", "ground_NRM.png", 200, 200, 250, 0, 10, scene, false, successCallback);


        //const sphere = BABYLON.Mesh.CreateBox("skyBox", 10.0, scene);


        // const box = BABYLON.MeshBuilder.CreateBox("box", {height: 25, width: 35}, scene);
        // box.material = skyboxMaterial;
        // box.position.x = -30;
        // box.position.y = 10;

        // // CreateCylinder("name", height, top-cone, bottom-cone, edges, diameter)
        // const cylinder = BABYLON.Mesh.CreateCylinder("cylinder", 10, 20, 20, 22, 2, scene);
        // // Vector3(x,y,z) -> positions
        // cylinder.position = new BABYLON.Vector3(30, 10, 4);
        //
        // const cylinderMaterial = new BABYLON.StandardMaterial("material", scene);
        // cylinderMaterial.emissiveColor = new BABYLON.Color3(1, 0.78, 0.4);
        // cylinder.material = cylinderMaterial;

        //------trump iddle------
        // let spriteManagerTrump = new BABYLON.SpriteManager("trumpManagerIddle", "sprites/trump_iddle.png", 4, 256, scene);
        // let trumpIddle = new BABYLON.Sprite("trumpIddle", spriteManagerTrump);
        // trumpIddle.position.y = 15;
        // trumpIddle.position.z = -100;
        // trumpIddle.size = 30;

        let map = {}; //object for multiple key presses
        scene.actionManager = new BABYLON.ActionManager(scene);

        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
            map[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
        }));

        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
            map[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
        }));

        // if(!scene.OnKeyDownTrigger || scene.OnKeyUpTrigger){
        //     trumpIddle.playAnimation(0, 9, true, 110);
        // }else{
        //     trumpWalk.playAnimation(0, 9, true, 110);
        // }

        // if(trumpWalk.intersectsMesh(cylinder, false)){
        //     cylinder.material.emissiveColor = new BABYLON.Color4(1, 0, 1, 1);
        // }else{
        //     cylinder.material.emissiveColor = new BABYLON.Color4(0, 0, 0, 1);
        // }
        trumpWalk.playAnimation(0, 9, true, 110);

        scene.registerAfterRender(function () {
            skybox.position = camera.position;
            // -----MOVE-----(can use two keys at once to move diagonally)
            //TODO flip trump image when he turns in different directions

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
            // else{
            //     trumpIddle.playAnimation(0, 9, true, 110);
            // }






        });



        // sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.9 }, scene);


        // ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);

        // sphere.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(1, 0, 1));

        //
        // scene.onPointerDown = function (evt, pickResult) {
        //     const cylinder = scene.getMeshByName("cylinder");
        //     const sphere = scene.getMeshByName("sphere");
        //     if (evt.hit) {
        //         cylinder.position.x = evt.sphere.x;
        //         cylinder.position.y = evt.sphere.y;
        //         console.log("hit");
        //         cylinder.ambientColor = new BABYLON.Color3(1, 1, 1);
        //     }
        // };

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
        // const sphere = scene.getMeshByName("sphere");
        // sphere.rotate(BABYLON.Axis.Z, 0.1);

        // const cylinder = scene.getMeshByName("cylinder");
        // cylinder.position.y = Math.sin(t*3);

    };
    engine.runRenderLoop(renderLoop);

    // engine.runRenderLoop(function () { // animation loop 60fps
    //     scene.render();
    // });

    window.addEventListener("resize", function () { // for smooth resizing
        engine.resize();
    });
});

