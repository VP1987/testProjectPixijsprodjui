import * as PIXI from "pixi.js";
import type { IScene, SceneId } from "@/core/types/index";
import { ErrorLogger } from "@/core/utils/ErrorLogger";
import { ParticleCounter } from "@/core/systems/debug/ParticleCounter";

export class SceneManager {
  private readonly container: PIXI.Container;
  private scenes: Map<SceneId, IScene> = new Map();
  private currentSceneId: SceneId | null = null;
  private currentScene: IScene | null = null;

  constructor() {
    this.container = new PIXI.Container();
  }

  register(id: SceneId, scene: IScene): void {
    this.scenes.set(id, scene);
    const sceneContainer = this.getSceneContainer(scene);
    if (sceneContainer) {
      sceneContainer.visible = false;
      this.container.addChild(sceneContainer);
    }
  }

  getScene(id: SceneId): IScene | undefined {
    return this.scenes.get(id);
  }

  navigateTo(id: SceneId): void {
    ParticleCounter.reset();

    if (this.currentScene) {
      this.currentScene.onExit();
      const oldContainer = this.getSceneContainer(this.currentScene);
      if (oldContainer) oldContainer.visible = false;
    }

    const nextScene = this.scenes.get(id);
    if (!nextScene) {
      ErrorLogger.critical(`Scene "${id}" not found`);
      return;
    }

    const nextContainer = this.getSceneContainer(nextScene);
    if (nextContainer) nextContainer.visible = true;

    this.currentScene = nextScene;
    this.currentSceneId = id;
    this.currentScene.onEnter();
  }

  update(deltaTime: number): void {
    this.currentScene?.update(deltaTime);
  }

  onResize(width: number, height: number): void {
    this.currentScene?.onResize(width, height);
  }

  getContainer(): PIXI.Container {
    return this.container;
  }

  getCurrentSceneId(): SceneId | null {
    return this.currentSceneId;
  }

  getCurrentScene(): IScene | null {
    return this.currentScene;
  }

  private getSceneContainer(scene: IScene): PIXI.Container | null {
    return scene.getContainer();
  }
}
