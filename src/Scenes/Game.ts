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
  Axis,
  CannonJSPlugin,
  ISceneLoaderAsyncResult,
  PhysicsImpostor,
  SceneLoader,
  StandardMaterial,
  UniversalCamera,
} from "@babylonjs/core";

enum State {
  START = 0,
  GAME = 1,
  LOSE = 2,
  CUTSCENE = 3,
}

export class Game extends Scene {
  private _canvas: HTMLCanvasElement;
  private _fly: ISceneLoaderAsyncResult;
  private _swatter: ISceneLoaderAsyncResult;

  constructor(engine: Engine) {
    super(engine);

    let gravityVector = new Vector3(0, -1, 0);
    this.enablePhysics(gravityVector, new CannonJSPlugin(true, 10, cannon));

    this._constructCamera();
    this.constructEnemies();

    this.createDefaultXRExperienceAsync().then((xr) => {
      xr.input.onControllerAddedObservable.add(async (controller) => {
        if (controller.inputSource.handedness === "right") {
          let swatter = await SceneLoader.ImportMeshAsync(
            "",
            "",
            FlySwatter,
            this
          );
          swatter.meshes[0].name = "Swatter";
          swatter.meshes[0].position = new Vector3(0.0, 0.0, 0.5);
          swatter.meshes[0].scaling = new Vector3(0.25, 0.25, 0.25);
          swatter.meshes[0].rotate(Axis.X, -Math.PI / 2);
          swatter.meshes[0].parent = controller.grip || controller.pointer;

          xr.input.onControllerRemovedObservable.add(() => {});
          this._swatter = swatter;
        }
      });
    });
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

    new HemisphericLight("dir02", new Vector3(0.2, -1, 0), this);
  }

  async constructEnemies() {
    let fly = await SceneLoader.ImportMeshAsync("", "", Fly, this);
    fly.meshes[0].name = "Fly";
    fly.meshes[0].position = new Vector3(0.0, 1.0, -8.5);
    fly.meshes[0].scaling = new Vector3(20.0, 20.0, 20.0);

    this._fly = fly;
  }

  update() {
    if (this._fly && this._swatter) {
      this._fly.meshes[0].translate(new Vector3(1, 0, 0), 0.0001);

      if (this._fly.meshes[0].intersectsMesh(this._swatter.meshes[2])) {
        this._fly.meshes[0].dispose();
        this._fly = null;
      }
    }
  }
}
