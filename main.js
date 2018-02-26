// const babylonjs = require("babylonjs")
// import * as BABYLON from 'babylonjs';

window.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById("renderCanvas");
    const engine = new BABYLON.Engine(canvas, true);


    const createScene = function () {
        const scene = new BABYLON.Scene(engine);

        //(x,y,z)
        const camera = new BABYLON.ArcRotateCamera("Camera", 0,canvas.height / 2, 10, BABYLON.Vector3.Zero(), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(canvas, false);

        // const light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 0, -7), scene);

        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);


        let sphere1 = BABYLON.Mesh.CreateSphere('sphere1', 16, 2, scene);
        let sphereMaterial = new BABYLON.StandardMaterial("material", scene);
        sphereMaterial.ambientColor = new BABYLON.Color3(0, .60, .58);
        sphere1.material = sphereMaterial;

        sphere1.rotation.x = -0.2;
        sphere1.rotation.y = -0.8;


        // light.diffuse = new BABYLON.Color3(0, 0, 0);
        // const box = BABYLON.Mesh.CreateBox("box", 2, scene);
        // box.rotation.x = -3;
        // box.rotation.y = -4;
        // box.position.y = -4;



        const skybox = BABYLON.Mesh.CreateBox("skyBox", 1000.0, scene);
        const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("skybox/skybox", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;

        const extraGround = BABYLON.Mesh.CreateGround("extraGround", 1000, 1000, 1, scene, false);
        const extraGroundMaterial = new BABYLON.StandardMaterial("extraGround", scene);


        extraGroundMaterial.diffuseTexture = new BABYLON.Texture("trigonum-vr-forest-ground-texture-ue4.jpg", scene);
        extraGroundMaterial.diffuseTexture.uScale = 60;
        extraGroundMaterial.diffuseTexture.vScale = 60;
        extraGround.position.y = -2.05;
        extraGround.material = extraGroundMaterial;


        // const water = BABYLON.Mesh.CreateGround("water", 1000, 1000, 1, scene, false);

        return scene;
    };
    let scene = createScene();

    const renderLoop = function () {
        scene.render();
        const material = scene.getMeshByName("sphere1").material;
        material.alpha -= 0.002;
        if(material.alpha <= 0) material.alpha = 1;

    };
    engine.runRenderLoop(renderLoop);

    // engine.runRenderLoop(function () { // animation loop 60fps
    //     scene.render();
    // });

    window.addEventListener("resize", function () { // for smooth resizing
        engine.resize();
    });
});

