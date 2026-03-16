import * as PIXI from "pixi.js";
import type { IScene, SceneId, NavigateFn } from "@/core/types/index";
import { AssetLoader } from "@/core/systems/AssetLoader";
import { ViewportScaler } from "@/core/systems/ViewportScaler";
import { GameSceneButton } from "@/core/ui/GameSceneButton";
import { FireEffect } from "../effects/sparkParticleFly/FireEffect";
import { ParticleFly } from "../effects/sparkParticleFly/ParticleFly";

export class FlamesOfPhoenixScene implements IScene {
  private readonly container: PIXI.Container;
  private app: PIXI.Application;
  private navigate: NavigateFn;
  private viewport: ViewportScaler;

  private bg: PIXI.Sprite | null = null;
  private particleEffect: ParticleFly | null = null;
  private fireEffect: FireEffect | null = null;
  private menuButton: GameSceneButton;

  constructor(
    app: PIXI.Application,
    navigate: NavigateFn,
    viewport: ViewportScaler,
  ) {
    this.app = app;
    this.navigate = navigate;
    this.viewport = viewport;
    this.container = new PIXI.Container();

    this.menuButton = new GameSceneButton(80, 110);
    this.menuButton.onMenuClick = () => this.navigate("menu");
  }

  async onEnter(): Promise<void> {
    this.app.stage.addChild(this.menuButton);
    this.menuButton.visible = true;

    await PIXI.Assets.loadBundle("flamesOfPhoenixAssets");

    this.bg = new PIXI.Sprite(AssetLoader.getTexture("backgroundPhoenix"));
    this.bg.anchor.set(0.5);
    this.container.addChildAt(this.bg, 0);

    this.particleEffect = new ParticleFly(this.app, this.container, 180, 20);
    this.fireEffect = new FireEffect(this.app, this.container);

    this.onResize(this.app.screen.width, this.app.screen.height);
  }

  private updateEffects(w: number, h: number): void {
    if (
      this.bg &&
      this.bg.texture &&
      (this.fireEffect || this.particleEffect)
    ) {
      const scale = Math.max(
        w / this.bg.texture.width,
        h / this.bg.texture.height,
      );
      const offsetY = 70; 
      const effectY = h / 2 + offsetY * scale;
      [this.fireEffect, this.particleEffect].forEach((fx) => {
        fx?.setPosition(w / 2, effectY);
        fx?.setScale(scale);
      });
    }
  }

  update(delta: number): void {
    this.particleEffect?.update(delta);
    this.fireEffect?.update(delta);
  }

  onResize(width: number, height: number): void {
    if (this.bg && this.bg.texture) {
      this.bg.x = width / 2;
      this.bg.y = height / 2;
      const scale = Math.max(
        width / this.bg.texture.width,
        height / this.bg.texture.height,
      );
      this.bg.scale.set(scale);
    }

    this.updateEffects(width, height);
    this.menuButton.resize(width, height);
    this.app.renderer.render(this.app.stage);
  }

  onExit(): void {
    this.menuButton.visible = false;
    if (this.menuButton.parent) {
      this.menuButton.parent.removeChild(this.menuButton);
    }

    this.particleEffect?.destroy();
    this.fireEffect?.destroy();

    if (this.bg) {
      this.container.removeChild(this.bg);
      this.bg.destroy();
      this.bg = null;
    }
  }

  getContainer(): PIXI.Container {
    return this.container;
  }
}
