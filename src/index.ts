import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import * as cannon from "cannon";

import { SampleMaterial } from "./Materials/SampleMaterial";
import {
  CannonJSPlugin,
  Color4,
  DirectionalLight,
  FreeCamera,
  Mesh,
  PhysicsImpostor,
  ShadowGenerator,
  StandardMaterial,
  UniversalCamera,
} from "@babylonjs/core";

enum State {
  START = 0,
  GAME = 1,
  LOSE = 2,
  CUTSCENE = 3,
}

class App {
  private _scene: Scene;
  private _canvas: HTMLCanvasElement;
  private _engine: Engine;

  //Scene - related
  private _state: number = 0;

  constructor() {
    this._canvas = this._createCanvas();

    // initialize babylon scene and engine
    this._engine = new Engine(this._canvas, true);

    this._scene = this._createScene();

    // hide/show the Inspector
    window.addEventListener("keydown", (ev) => {
      // Shift+Ctrl+Alt+I
      if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
        if (this._scene.debugLayer.isVisible()) {
          this._scene.debugLayer.hide();
        } else {
          this._scene.debugLayer.show();
        }
      }
    });

    // run the main render loop
    this._engine.runRenderLoop(() => {
      this._scene.render();
    });
  }

  _createCanvas() {
    var canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.id = "gameCanvas";
    document.body.appendChild(canvas);

    return canvas;
  }

  _createScene(): Scene {
    // Create scene
    let scene: Scene = new Scene(this._engine);
    let gravityVector = new Vector3(0, -1, 0);
    scene.enablePhysics(gravityVector, new CannonJSPlugin(true, 10, cannon));

    let light = new HemisphericLight("light", Vector3.Zero(), scene);

    // Create camera
    var camera = new UniversalCamera(
      "UniversalCamera",
      new Vector3(0, 0, -10),
      scene
    );
    camera.checkCollisions = true;
    camera.applyGravity = true;
    // Targets the camera to a particular position. In this case the scene origin
    camera.setTarget(Vector3.Zero());

    camera.attachControl(this._canvas, true);

    var ground = Mesh.CreatePlane("ground", 25.0, scene);
    ground.position = new Vector3(0, -10, 0);
    ground.rotation = new Vector3(Math.PI / 2, 0, 0);

    ground.material = new StandardMaterial("groundMat", scene);
    ground.material.backFaceCulling = false;
    ground.receiveShadows = true;
    ground.physicsImpostor = new PhysicsImpostor(
      ground,
      PhysicsImpostor.BoxImpostor,
      { mass: 0, friction: 1, restitution: 0 },
      scene
    );

    var sphereLight = new DirectionalLight(
      "dir02",
      new Vector3(0.2, -1, 0),
      scene
    );
    sphereLight.position = new Vector3(0, 80, 0);

    // Create sphere
    var sphere1: Mesh = MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 1 },
      scene
    );
    sphere1.position.y = 5;
    sphere1.material = new StandardMaterial("sphere material", scene);
    sphere1.physicsImpostor = new PhysicsImpostor(
      sphere1,
      PhysicsImpostor.SphereImpostor,
      { mass: 1 },
      scene
    );
    var shadowGenerator = new ShadowGenerator(2048, sphereLight);
    shadowGenerator.addShadowCaster(sphere1);

    // Enable VR
    var vrHelper = scene.createDefaultVRExperience();
    vrHelper.enableInteractions();

    return scene;
  }

  private async _goToStart() {
    this._engine.displayLoadingUI(); //make sure to wait for start to load

    //--SCENE SETUP--
    //dont detect any inputs from this ui while the game is loading
    this._scene.detachControl();
    let scene = new Scene(this._engine);
    scene.clearColor = new Color4(0, 0, 0, 1);
  }
}
new App();
