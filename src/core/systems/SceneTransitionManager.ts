import * as PIXI from "pixi.js";
import { SceneManager } from "./SceneManager";
import { SceneId } from "@/core/types";
import { ErrorLogger } from "@/core/utils/ErrorLogger";

export class SceneTransitionManager {
  public static instance: SceneTransitionManager;
  private sceneManager: SceneManager;
  private transitionInProgress: boolean = false;

  private constructor(
    application: PIXI.Application,
    sceneManager: SceneManager,
  ) {
    this.sceneManager = sceneManager;
  }

  public static initialize(
    application: PIXI.Application,
    sceneManager: SceneManager,
  ): void {
    if (SceneTransitionManager.instance) return;
    SceneTransitionManager.instance = new SceneTransitionManager(
      application,
      sceneManager,
    );
  }

  public async transitionTo(
    nextSceneId: SceneId,
    useLoadingScene?: boolean,
  ): Promise<void> {
    if (this.transitionInProgress) {
      return;
    }
    this.transitionInProgress = true;

    const currentScene = this.sceneManager.getCurrentScene();
    const currentContainer = currentScene?.getContainer();

    if (currentContainer) {
      await this.animateAlpha(currentContainer, 1, 0, 0.4);
      currentContainer.visible = false;
    }

    if (useLoadingScene === undefined) {
      useLoadingScene = nextSceneId !== "menu" && nextSceneId !== "loading";
    }

    let actualNextScene = nextSceneId;
    if (useLoadingScene && nextSceneId !== "loading") {
      const loadingScene = this.sceneManager.getScene("loading") as any;
      if (loadingScene && typeof loadingScene.setTargetScene === "function") {
        loadingScene.setTargetScene(nextSceneId);
      }
      actualNextScene = "loading";
    }

    this.sceneManager.navigateTo(actualNextScene);

    const newScene = this.sceneManager.getCurrentScene();
    const newContainer = newScene?.getContainer();

    if (newContainer) {
      newContainer.alpha = 0;
      newContainer.visible = true;
      await this.animateAlpha(newContainer, 0, 1, 0.4);
    } else {
      ErrorLogger.critical(
        `Failed to get container for new scene: ${nextSceneId}`,
      );
    }

    this.transitionInProgress = false;
  }

  private animateAlpha(
    targetContainer: PIXI.Container,
    startAlpha: number,
    endAlpha: number,
    durationSeconds: number,
  ): Promise<void> {
    return new Promise((resolve) => {
      targetContainer.alpha = startAlpha;
      let elapsedSeconds = 0;

      const onTick = () => {
        const deltaMs = PIXI.Ticker.shared.elapsedMS;
        elapsedSeconds += deltaMs / 1000;

        const progress = Math.min(elapsedSeconds / durationSeconds, 1);
        targetContainer.alpha = startAlpha + (endAlpha - startAlpha) * progress;

        if (progress >= 1) {
          PIXI.Ticker.shared.remove(onTick);
          resolve();
        }
      };

      PIXI.Ticker.shared.add(onTick);
    });
  }
}
