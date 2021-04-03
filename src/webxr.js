import { Scene } from "@babylonjs/core/scene";
import { SceneHelper } from "@babylonjs/core/Helpers/sceneHelpers"; // TODO: figure out how to include this without it being greyed out.
import { Engine } from "@babylonjs/core/Engines/engine";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Color4, Vector3 } from "@babylonjs/core/Maths";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Mesh, MeshBuilder } from "@babylonjs/core/Meshes";
import { Loaders } from "@babylonjs/loaders"; // TODO: figure out how to include without it being greyed out. We need this to load gltf and glb models.
import { GLTFLoader } from "@babylonjs/loaders/glTF/2.0";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";

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
    var camera = new FreeCamera("camera1", new Vector3(0, 2, -1), scene);
    camera.setTarget(new Vector3(0,0,100));
    camera.attachControl(canvas, true);
    
    var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    //var sphere = Mesh.CreateSphere("sphere1", 16, 2, scene);
    //sphere.position = new Vector3(0, 1, 3);

    let box = MeshBuilder.CreateBox("box", {
        height: 1,
        width: 1,
        depth: 0.05,
    }, scene);

    //I'm gonna try to load a chalkboard through Gltf loader. Let's see if I can project the ray on the board.
    //let loader = new GLTFLoader();
    //loader.importMeshAsync()
    SceneLoader.ImportMesh("", "scenes/gltf/cube-room/", "cube-room.gltf", scene, (newMeshes) => {
        let cubeRoom = newMeshes[0];
        cubeRoom.translate(new Vector3(0, 0, 1), -3);
        console.log(cubeRoom);
    });

    SceneLoader.ImportMesh("", "scenes/", "eraser.glb", scene, newMeshes => {
        let eraser = newMeshes[0];
        //eraser.translate(new Vector3(0, 0, -1), 1);
        //eraser.translate(new Vector3(0, 1, 0), 3);
        eraser.position = new Vector3(-1, 2, -3);
    });

    /*SceneLoader.ImportMesh("", "scenes/", "Classroom.glb", scene, (newMeshes) => {
        let chalkboard = newMeshes[0];
        chalkboard.scaling = new Vector3(10, 10, 1);
        chalkboard.position = new Vector3(0, 1, -3);
        camera.setTarget(chalkboard.position);
        console.log(chalkboard);
    });*/


    const env = scene.createDefaultEnvironment({ enableGroundShadow: true });

    const xr = await scene.createDefaultXRExperienceAsync({
        floorMeshes: [env.ground]
    });

    let sessionManager = xr.baseExperience.sessionManager;
    await sessionManager.initializeSessionAsync('immersive-vr' /*, xrSessionInit */ );
    const referenceSpace = await sessionManager.setReferenceSpaceTypeAsync( "local" );
    console.log(sessionManager.session);
    console.log(referenceSpace);
    //let xrRefSpace = await session.requestReferenceSpace('local');

    /*xr.baseExperience.sessionManager.onXRFrameObservable.addOnce((frame) => {        
        let pose = frame.getViewerPose(referenceSpace);
        if (pose) {
            for (let view of pose.views) {
                console.log(view);
                if (view.eye == "left") {
                    sphere.visibility = false;    
                    //view.transform = new XRRigidTransform(new DOMPointReadOnly(0, 0, 0, 1), new DOMPointReadOnly(0.5, 0, 0, 1));
                    // trigger scene drawing somehow         
                }
                else {
                    sphere.visibility = true;
                    // trigger scene drawing somehow
                }
            }
        }
    });*/

    scene.onBeforeCameraRenderObservable.add((camera) => {
        /*if (camera.isRightCamera) {
            eraser.visibility = false;
        }
        else {
            eraser.visibility = true;
        }*/
    });

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