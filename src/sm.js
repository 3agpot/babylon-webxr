import { Engine, WebXRSessionManager } from "@babylonjs/core";
import { Scene } from "@babylonjs/core/scene";

const canvas = document.getElementById("smCanvas");

const engine = new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    disableWebGL2Support: false
});

const scene = new Scene(engine);

const sessionManager = new WebXRSessionManager(scene);

console.log(sessionManager);

(async function() {
    console.log("I think this will print before");
    const supported = await WebXRSessionManager.IsSessionSupportedAsync('immersive-vr');
    
    if (supported) {
        console.log("immersive-vr session mode is supported");
    } else {
        console.log("immersive-vr session mode is NOT supported");
    }

    await sessionManager.initializeAsync();
    console.log(sessionManager._xrNavigator);
    await sessionManager.initializeSessionAsync('immersive-vr' /*, xrSessionInit */ );
    console.log("initialized immersive-vr session");

    console.log(sessionManager.session);
    const referenceSpace = await sessionManager.setReferenceSpaceTypeAsync("local");
    console.log(referenceSpace);

    const renderTarget = sessionManager.getWebXRRenderTarget( /*outputCanvasOptions: WebXRManagedOutputCanvasOptions*/ );
    console.log(renderTarget);
    const xrWebGLLayer = await renderTarget.initializeXRLayerAsync(sessionManager.session);

    console.log(xrWebGLLayer);

    sessionManager.runXRRenderLoop();
})();

