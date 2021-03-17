import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { WaterMaterial } from "@babylonjs/materials/water";
import { NormalMaterial} from "@babylonjs/materials/normal";
// Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import "@babylonjs/core/Meshes/meshBuilder";

let engine = null;

let createScene = async function() {
    // Get the canvas element from the DOM.
    const canvas = document.getElementById("renderCanvas");
    // Associate a Babylon Engine to it.
    engine = new Engine(canvas);
    // Create our first scene.
    var scene = new Scene(engine);
    // This creates and positions a free camera (non-mesh)
    var camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
    // This targets the camera to scene origin
    camera.setTarget(Vector3.Zero());
    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);
    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;
    // Create a grid material
    var material = new WaterMaterial("grid", scene);
    var sphereMaterial = new NormalMaterial("normal", scene);
    // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
    var sphere = Mesh.CreateSphere("sphere1", 16, 2, scene);
    // Move the sphere upward 1/2 its height
    sphere.position.y = 2;
    // Affect a material
    sphere.material = sphereMaterial;
    // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
    var ground = Mesh.CreateGround("ground1", 6, 6, 2, scene);
    // Affect a material
    ground.material = material;
    // Render every frame

    return scene;
}

let scene = null;

(async () => {
    try {
        scene = await createScene();
        engine.runRenderLoop(() => {
            scene.render();
        });
    } catch (e) {
        console.log("the top level async call failed");
        console.log(e);
    }
})();


