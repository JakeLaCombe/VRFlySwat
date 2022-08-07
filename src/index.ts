import "@babylonjs/loaders/glTF";
import "@babylonjs/inspector";

import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import * as cannon from "cannon";

import { SampleMaterial } from "./Materials/SampleMaterial";
import FlySwatter from "./Models/Fly_Swatter.glb";
import Fly from "./Models/fly3.glb";

import {
  CannonJSPlugin,
  Color4,
  DirectionalLight,
  FreeCamera,
  Mesh,
  PhysicsImpostor,
  SceneLoader,
  ShadowGenerator,
  StandardMaterial,
  UniversalCamera,
} from "@babylonjs/core";
import {
  Button3D,
  GUI3DManager,
  StackPanel3D,
  TextBlock,
} from "@babylonjs/gui";
import { Game } from "./Scenes/Game";

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
      if (this._scene instanceof Game) {
        this._scene.update();
      }

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

    let manager = new GUI3DManager(scene);
    let panel = new StackPanel3D();
    panel.margin = 0.02;
    manager.addControl(panel);
    this.startGameButton(panel);

    var sphereLight = new DirectionalLight(
      "dir02",
      new Vector3(0.2, -1, 0),
      scene
    );
    sphereLight.position = new Vector3(0, 80, 0);

    // Create camera
    var camera = new UniversalCamera(
      "UniversalCamera",
      new Vector3(0, 0, -10),
      scene
    );

    camera.setTarget(Vector3.Zero());

    camera.attachControl(this._canvas, true);

    // Enable VR
    var vrHelper = scene.createDefaultVRExperience();
    vrHelper.enableInteractions();

    return scene;
  }

  startGameButton(panel: StackPanel3D) {
    var button = new Button3D();
    panel.addControl(button);
    button.onPointerUpObservable.add(() => {
      this._scene = new Game(this._engine);
      panel.removeControl(button);
    });
    var text1 = new TextBlock();
    text1.text = "Start Game";
    text1.color = "white";
    text1.fontSize = 24;
    button.content = text1;
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
