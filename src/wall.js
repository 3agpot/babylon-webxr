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
        radius: 0.08,
        updatable: true,
    }, scene);
    
    disc.position = new Vector3(-1, 1, 0.45);
    
    let discMaterial = new StandardMaterial("discMaterial", scene);
    discMaterial.alpha = 1;
    disc.material = discMaterial;

    let torus = MeshBuilder.CreateTorus("torus", {
        diameter: 0.25,
        thickness: 0.04,
    }, scene);

    torus.isPickable = false;
    torus.position = new Vector3(-1, 1, 0.45);
    torus.rotation.x = Math.PI/2;
    let torusMaterial = new StandardMaterial("torusMaterial", scene);
    torusMaterial.alpha = 1;
    torusMaterial.diffuseColor = new Color3(1.0, 0.2, 0.7);
    torus.material = torusMaterial;

    const env = scene.createDefaultEnvironment({ enableGroundShadow: true });

    const xr = await scene.createDefaultXRExperienceAsync({
        floorMeshes: [env.ground]
    });

    //xr.pointerSelection.displayLaserPointer = false;
    xr.pointerSelection.displaySelectionMesh = false;

    scene.onBeforeCameraRenderObservable.add((camera) => {
        
        /*if (camera.isRightCamera) {
            disc.visibility = false;
        }
        else {
            disc.visibility = true;
        }*/
    });

    xr.input.onControllerAddedObservable.add(inputSource => {       
        scene.onBeforeRenderObservable.add(something => {
            // we only need the right controller
            if (inputSource.inputSource.handedness !== "right") return;
            
            const ray = new Ray(inputSource.pointer.absolutePosition, inputSource.pointer.forward, Infinity);
            inputSource.getWorldPointerRayToRef(ray);

            var hit = scene.pickWithRay(ray);
            if (hit.pickedMesh && hit.pickedMesh === wall) {
                if (hit.pickedPoint) {
                    torus.position = hit.pickedPoint;
                }
            }
            disc.material.diffuseColor = new Vector3(1, 0, 1);
            if (ray.intersectsMesh(disc)) {
                console.log("intersects the disc");
                disc.material.diffuseColor = new Color3(0, 0, 1);
            }
        });
    });

    xr.baseExperience.sessionManager.onXRSessionInit.add(() => {
        console.log("XR session initialized");
    });

    return scene;
};

var engine;
var scene;

let initFunction = async () => {               
    var asyncEngineCreation = async () => {
        return createDefaultEngine();
    }

    engine = await asyncEngineCreation();
    if (!engine) throw 'engine should not be null.';
    scene = createScene();
};

initFunction().then(() => {
    scene.then(returnedScene => {
        sceneToRender = returnedScene;
    });

    engine.runRenderLoop(() => {
        if (sceneToRender && sceneToRender.activeCamera) {
            sceneToRender.render();
        }
    });
});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});