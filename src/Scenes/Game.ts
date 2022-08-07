import "@babylonjs/loaders/glTF";
import "@babylonjs/inspector";

import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import * as cannon from "cannon";

import FlySwatter from "../Models/Fly_Swatter.glb";
import Fly from "../Models/fly3.glb";

import {
  CannonJSPlugin,
  Color4,
  DirectionalLight,
  FreeCamera,
  ISceneLoaderAsyncResult,
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

enum State {
  START = 0,
  GAME = 1,
  LOSE = 2,
  CUTSCENE = 3,
}

export class Game extends Scene {
  private _scene: Scene;
  private _canvas: HTMLCanvasElement;
  private _fly: ISceneLoaderAsyncResult;
  private _swatter: ISceneLoaderAsyncResult;

  //Scene - related
  private _state: number = 0;

  constructor(engine: Engine) {
    super(engine);

    let gravityVector = new Vector3(0, -1, 0);
    this.enablePhysics(gravityVector, new CannonJSPlugin(true, 10, cannon));

    this._constructCamera();
    this.constructEnemies();
  }

  _constructCamera() {
    var camera = new UniversalCamera(
      "UniversalCamera",
      new Vector3(0, 0, -10),
      this
    );
    camera.checkCollisions = true;
    camera.applyGravity = true;
    // Targets the camera to a particular position. In this case the scene origin
    camera.setTarget(Vector3.Zero());

    camera.attachControl(this._canvas, true);

    var ground = MeshBuilder.CreatePlane("ground", { width: 25 }, this);
    ground.position = new Vector3(0, 0, 0);
    ground.rotation = new Vector3(Math.PI / 2, 0, 0);

    ground.material = new StandardMaterial("groundMat", this);
    ground.material.backFaceCulling = false;
    ground.receiveShadows = true;
    ground.physicsImpostor = new PhysicsImpostor(
      ground,
      PhysicsImpostor.BoxImpostor,
      { mass: 0, friction: 1, restitution: 0 },
      this
    );

    var sphereLight = new HemisphericLight(
      "dir02",
      new Vector3(0.2, -1, 0),
      this
    );

    console.log("Constructed Cameras");
  }

  async constructEnemies() {
    let swatter = await SceneLoader.ImportMeshAsync("", "", FlySwatter, this);
    swatter.meshes[0].name = "Swatter";
    swatter.meshes[0].position = new Vector3(0.0, 0.0, -1.0);

    let fly = await SceneLoader.ImportMeshAsync("", "", Fly, this);
    fly.meshes[0].name = "Fly";
    fly.meshes[0].position = new Vector3(0.0, 1.0, -5.0);
    fly.meshes[0].scaling = new Vector3(20.0, 20.0, 20.0);

    this._fly = fly;

    this._swatter = swatter;
  }

  update() {
    if (this._fly) {
      this._fly.meshes[0].translate(new Vector3(1, 0, 0), 0.0001);
    }
  }
}
