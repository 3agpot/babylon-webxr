import { Scene } from "@babylonjs/core/scene";
import { SceneHelper } from "@babylonjs/core/Helpers/sceneHelpers"; // TODO: figure out how to include this without it being greyed out.
import { Engine } from "@babylonjs/core/Engines/engine";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Color3, Color4, Space, Vector3 } from "@babylonjs/core/Maths";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Mesh, MeshBuilder } from "@babylonjs/core/Meshes";
import { Loaders } from "@babylonjs/loaders"; // TODO: figure out how to include without it being greyed out. We need this to load gltf and glb models.
import { GLTFLoader } from "@babylonjs/loaders/glTF/2.0";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { CubeTexture, Ray, Texture } from "@babylonjs/core";

var canvas = document.getElementById("webxrCanvas");

var engine = null;
var scene = null;
var sceneToRender = null;

var createDefaultEngine = function() {
    return new Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
        disableWebGL2Support: false
    });
};

var createScene = async function () {

    var scene = new Scene(engine);
    var camera = new FreeCamera("camera1", new Vector3(0, 0.5, -2), scene);
    camera.setTarget(new Vector3(0,0,100));
    camera.attachControl(canvas, true);
    
    var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    let wall = MeshBuilder.CreateBox("wall", {
        height: 1,
        width: 1,
        depth: 0.05,
        faceColors: [
            new Color4(1,0,0,1),
            new Color4(0,1,0,1),
            new Color4(1,1,0,1),
            new Color4(0,1,1,1),
            new Color4(0,0,1,1),
            new Color4(1,0,1,1),
        ]
    }, scene);

    wall.scaling = new Vector3(4,4,1);
    wall.position = new Vector3(0, 0.5, 0.5);

    let ground = MeshBuilder.CreateGround("Woodfloor", {
        width: 2,
        height: 2,
    });

    let verticalPlaneAlongX = MeshBuilder.CreatePlane("planeX", {
        size: 0.1,
        updatable: true,
    }, scene);

    let disc = MeshBuilder.CreateDisc("target", {
        radius: 0.1,
        updatable: true,
    }, scene);

    disc.position = new Vector3(-1, 1, 0.45);
    let discMaterial = new StandardMaterial("discMaterial", scene);
    discMaterial.alpha = 1;
    discMaterial.diffuseColor = new Color3(1.0, 0.2, 0.7);
    disc.material = discMaterial;

    const env = scene.createDefaultEnvironment({ enableGroundShadow: true });

    const xr = await scene.createDefaultXRExperienceAsync({
        floorMeshes: [env.ground]
    });

    scene.onBeforeCameraRenderObservable.add((camera) => {
        
        if (camera.isRightCamera) {
            disc.visibility = false;
        }
        else {
            disc.visibility = true;
        }
    });

    xr.input.onControllerAddedObservable.add(inputSource => {
        //const ray = new Ray(inputSource.pointer.absolutePosition, inputSource.pointer.forward, Infinity);
        //inputSource.getWorldPointerRayToRef(ray);
        //console.log(inputSource);
        scene.onBeforeRenderObservable.add(something => {
            if (inputSource.inputSource.handedness !== "right") return;
            const ray = new Ray(inputSource.pointer.absolutePosition, inputSource.pointer.forward, Infinity);
            inputSource.getWorldPointerRayToRef(ray);
            console.log(ray.direction);

            disc.position.x = ray.direction.x;
            //disc.translate(new Vector3(1, -1, 0), 0.001, Space.WORLD);
        });
        /*inputSource.onMotionControllerInitObservable.add(motionController => {
            if (motionController.handedness != "right") return;
            console.log(motionController);
            
        });*/
    });

    /*xr.baseExperience.sessionManager.onXRFrameObservable.add(frame => {
        let inputSources = xr.input.controllers;//frame.session.inputSources;
        let rightController = inputSources.find(c => c.inputSource.handedness === "right");
        
        const ray = new Ray(rightController.pointer.absolutePosition, rightController.pointer.forward, Infinity);
        rightController.getWorldPointerRayToRef(ray);
        console.log(ray.direction);
    });*/

    //console.log(xr.baseExperience.sessionManager);

    /*xr.baseExperience.sessionManager.onXRSessionInit.add(() => {
        let rightMotionController = xr.input.controllers[1];
        console.log(rightMotionController);
    });*/

    return scene;
};

var engine;
var scene;

let initFunction = async function() {               
    var asyncEngineCreation = async function() {
        try {
            return createDefaultEngine();
        } catch(e) {
            console.log("the available createEngine function failed. Creating the default engine instead");
            return createDefaultEngine();
        }
    }

    engine = await asyncEngineCreation();
    if (!engine) throw 'engine should not be null.';
    scene = createScene();
};

initFunction().then(() => {
    scene.then(returnedScene => {
        sceneToRender = returnedScene;
    });

    engine.runRenderLoop(function () {
        if (sceneToRender && sceneToRender.activeCamera) {
            sceneToRender.render();
        }
    });
});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});