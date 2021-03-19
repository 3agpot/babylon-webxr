import { Scene } from "@babylonjs/core/scene";
import { SceneHelper } from "@babylonjs/core/Helpers/sceneHelpers"; // TODO: figure out how to include this without it being greyed out.
import { Engine } from "@babylonjs/core/Engines/engine";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Vector3 } from "@babylonjs/core/Maths";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
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
    let pointLight = new PointLight('light2', new Vector3(0.5, 5, 0.5), scene);
    pointLight.intensity = 0.2;
    var sphere = Mesh.CreateSphere("sphere1", 16, 2, scene);
    sphere.position.y = 1;
    

    const env = scene.createDefaultEnvironment();

    /*const xr = await scene.createDefaultXRExperienceAsync({
        floorMeshes: [env.ground]
    });*/

    try {
        console.log("before");
        const xrHelper = await WebXRExperienceHelper.CreateAsync(scene);
        console.log("after");
        xrHelper.onStateChangedObservable.add((state) => {
            switch (state) {
                case WebXRState.IN_XR:
                    console.log("XR is initialized and already submitted one frame")
                case WebXRState.ENTERING_XR:
                    console.log("xr is being initialized, enter XR request was made");
                case WebXRState.EXITING_XR:
                    console.log("xr exit request was made. not yet done");
                case WebXRState.NOT_IN_XR:
                    console.log("self explanatory - either our or not yet in XR");
            }
        })
        const sessionManager = await xrHelper.enterXRAsync("immersive-vr", "local-floor"); 
        const supported = await sessionManager.isSessionSupportedAsync('immersive-vr');
        
        if (supported) {
            console.log("xr available, session supported");
            const xr = sessionManager.initializeSessionAsync('immersive-vr' /*, xrSessionInit */ );
        }
    } catch (e) {
        console.log("no XR support");
        console.error(e);
    }

    /*let cam = xr.input.xrCamera
    console.log("logging camera");
    console.log(cam);*/

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