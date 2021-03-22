import { Scene } from "@babylonjs/core/scene";
import { SceneHelper } from "@babylonjs/core/Helpers/sceneHelpers"; // TODO: figure out how to include this without it being greyed out.
import { Engine } from "@babylonjs/core/Engines/engine";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Vector3 } from "@babylonjs/core/Maths";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Mesh } from "@babylonjs/core/Meshes";
import { Loaders } from "@babylonjs/loaders"; // TODO: figure out how to include without it being greyed out. We need this to load gltf and glb models.

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
    var camera = new FreeCamera("camera1", new Vector3(0, 5, -5), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);
    var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    var sphere = Mesh.CreateSphere("sphere1", 16, 2, scene);
    sphere.position.y = 1;

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

    xr.baseExperience.sessionManager.onXRFrameObservable.add((frame) => {
        //console.log(xr.baseExperience.camera);
        //console.log(frame.session);
        console.log(frame);
        
        let pose = frame.getViewerPose(referenceSpace);
        if (pose) {
            for (let view of pose.views) {
                if (view.eye == "left") {
                    sphere.visibility = true;                    
                }
                else {
                    sphere.visibility = false;
                }
                //if view is left, then set the visible to false for the desk
                /*if (view.eye == "left") {
                scene.children[2].visible = false;
                scene.draw(view.projectionMatrix, view.transform);
                }
                else {
                scene.children[2].visible = true;
                scene.draw(view.projectionMatrix, view.transform);
                }*/

            }

        }
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