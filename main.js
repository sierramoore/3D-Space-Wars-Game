let resource2;
window.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById("renderCanvas");
    const engine = new BABYLON.Engine(canvas, true);

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

    const landPoint = function (p) {
        return BABYLON.Vector3.Normalize(p).scale(planetRadius);
    };

    const moveCharacter = function(character, speed, x, z) {
        character.rotation.y = Math.atan2(x, z);
        character.parent.rotate(new BABYLON.Vector3(z, 0, -x).normalize(), speed, BABYLON.Space.LOCAL);
    };


    const createScene = function () {
        const scene = new BABYLON.Scene(engine);
        scene.enablePhysics();


        const camera = new BABYLON.ArcRotateCamera("Camera", 0, canvas.height/2, 10, BABYLON.Vector3.Zero(), scene);
        camera.setPosition(new BABYLON.Vector3(0, 0, 500));
        camera.attachControl(canvas, false);
        // camera.lowerBetaLimit = 0.1;
        // camera.upperBetaLimit = canvas.height / 2;
        camera.lowerRadiusLimit = 150;


        const skybox = BABYLON.Mesh.CreateBox("skybox", 10000.0, scene);
        createAxis(200, scene).parent = skybox;
        const skyboxMaterial = new BABYLON.StandardMaterial("skybox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox/sky", scene, ["_px.png", "_py.png", "_pz.png", "_nx.png","_ny.png", "_nz.png"]);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;

        const planet = BABYLON.MeshBuilder.CreateSphere('sphere', {diameter: planetRadius * 2}, scene);
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
        const charater = new BABYLON.MeshBuilder.CreateSphere('charater', {diameter: 10}, scene);
        charater.parent = charaterRoot;
        charater.position.y = planetRadius;//landPoint(new BABYLON.Vector3(0, 0, -1));
        charater.material = new BABYLON.StandardMaterial('charaterMaterial', scene);
        charater.material.diffuseColor = new BABYLON.Color3(1,0,1);
        createAxis(20, scene).parent = charater;

        // const camera = new BABYLON.ArcFollowCamera("characterCamera", Math.PI/2, 0.1, 500, charater, scene);
        camera.parent = charaterRoot;
        // console.log(charaterRoot.rotation.x)


        function randomSpherePoint(x0,y0,z0){
            let u = Math.random();
            let v = Math.random();
            let theta = 2 * Math.PI * u;
            let phi = Math.acos(2 * v - 1);
            let x = x0 + (planetRadius * Math.sin(phi) * Math.cos(theta));
            let y = y0 + (planetRadius * Math.sin(phi) * Math.sin(theta));
            let z = z0 + (planetRadius * Math.cos(phi));
            return [x,y,z];
        }


        const resource1 = new BABYLON.MeshBuilder.CreateSphere("resource1", {diameter: 15}, scene);
        resource1.material = new BABYLON.StandardMaterial("resourceMaterial1", scene);
        resource1.material.diffuseColor = new BABYLON.Color3(0,0,1);
        const [x, y, z] = randomSpherePoint(0,0,0);
        resource1.position = new BABYLON.Vector3(x, y, z);


        const resources = [resource1, resource2];
        // select random resource
        const resourceGenerator = function(){
            let randomIndex = Math.floor(Math.random() * 2);
            return resources[randomIndex];
        };
        console.log(resourceGenerator());



        let map = {}; //object for multiple key presses
        scene.actionManager = new BABYLON.ActionManager(scene);

        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
            map[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
        }));

        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
            map[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
        }));

        
        scene.registerAfterRender(function () {
            // skybox.position = camera.position;
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
                //charater.position.y += 3;
                // light.position.y += 1;
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

    const renderLoop = function () {
        scene.render();
    };
    engine.runRenderLoop(renderLoop);


    window.addEventListener("resize", function () { // for smooth resizing
        engine.resize();
    });
});

