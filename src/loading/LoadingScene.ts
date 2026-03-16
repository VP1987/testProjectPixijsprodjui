import * as PIXI from "pixi.js";
import type { IScene, SceneId, IFontConfig } from "@/core/types/index";
import { AssetLoader } from "@/core/systems/AssetLoader";
import { BitmapTextComponent } from "@/core/ui/BitmapTextComponent";
import { LoadingLayoutHandler } from "./layout/LoadingLayoutHandler";
import { TextureFactory } from "@/core/infrastructure/TextureFactory";
import { ProgressBarComponent } from "./components/ProgressBarComponent";
import { SceneTransitionManager } from "@/core/systems/SceneTransitionManager";
import { FontManager } from "@/core/infrastructure/FontManager";
import { LocalFonts } from "./fonts/LocalFonts";

import { ErrorLogger } from "@/core/utils/ErrorLogger";

export class LoadingScene implements IScene {
  private readonly container: PIXI.Container;
  private readonly backgroundLayer: PIXI.Container;
  private readonly uiLayer: PIXI.Container;
  private readonly layoutHandler: LoadingLayoutHandler;
  private app: PIXI.Application;
  private navigate: (id: SceneId) => void;

  private backgroundSprite: PIXI.Sprite | null = null;
  private titleText: BitmapTextComponent | null = null;
  private subText: BitmapTextComponent | null = null;
  private divisionLine: PIXI.Sprite | null = null;
  private progressBarComponent: ProgressBarComponent | null = null;
  private progressFrameTexture: PIXI.RenderTexture | null = null;
  private divisionLineTexture: PIXI.Texture | null = null;

  private loadingComplete: boolean = false;
  private targetSceneId: SceneId;
  private startTime: number = 0;
  private readonly totalExpectedDurationMs: number = 3200;
  private displayedLoadProgress: number = 0;
  private hasTransitioned: boolean = false;

  constructor(
    app: PIXI.Application,
    navigate: (id: SceneId) => void,
    targetSceneId: SceneId,
  ) {
    this.app = app;
    this.navigate = navigate;
    this.targetSceneId = targetSceneId;
    this.container = new PIXI.Container();
    this.backgroundLayer = new PIXI.Container();
    this.uiLayer = new PIXI.Container();
    this.container.addChild(this.backgroundLayer, this.uiLayer);
    this.layoutHandler = new LoadingLayoutHandler();
  }

  public setTargetScene(id: SceneId): void {
    this.targetSceneId = id;
  }

  async onEnter(): Promise<void> {
    this.resetState();

    try {
      const bundleName = `${this.targetSceneId}Assets`;

      const remainingFontConfigs: IFontConfig[] = [
        ...LocalFonts,
        {
          id: "menuButtonFont",
          fontFile: "/customFonts/MGF-PinlockPersonalUse.otf",
          fillColor: 0xffdb29,
          outlineColor: 0xfc2e2e,
          size: 100,
        },
      ];

      await Promise.all([
        PIXI.Assets.loadBundle(bundleName),
        FontManager.instance.loadAndRegisterFonts(remainingFontConfigs),
      ]);

      this.createObjects();
      this.onResize(window.innerWidth, window.innerHeight);

      this.app.ticker.remove(this.update, this);
      this.app.ticker.add(this.update, this);

      this.loadingComplete = true;
    } catch (error) {
      ErrorLogger.critical("Failed to load assets", error);
    }
  }

  private resetState(): void {
    this.loadingComplete = false;
    this.startTime = performance.now();
    this.hasTransitioned = false;
    this.displayedLoadProgress = 0;
  }

  private createObjects(): void {
    this.clearDisplayObjects();

    const backgroundTexture = AssetLoader.getTexture("backgroundLobby");
    this.backgroundSprite = new PIXI.Sprite(backgroundTexture);
    this.backgroundSprite.anchor.set(0.5);
    this.backgroundLayer.addChild(this.backgroundSprite);

    try {
      this.titleText = new BitmapTextComponent(
        "menuTitleFont",
        "SOFTGAMES",
        true,
      );
      this.uiLayer.addChild(this.titleText);
    } catch (error) {
      ErrorLogger.warn("Error title", error);
    }

    try {
      this.subText = new BitmapTextComponent(
        "menuSubtitleFont",
        "GAME DEVELOPER ASSIGNMENT",
        true,
      );
      this.uiLayer.addChild(this.subText);
    } catch (error) {
      ErrorLogger.warn("Error sub", error);
    }

    this.divisionLineTexture = TextureFactory.divLine(800, 4, 0xffd54a);
    this.divisionLine = new PIXI.Sprite(this.divisionLineTexture);
    this.divisionLine.anchor.set(0.5, 0.5);
    this.uiLayer.addChild(this.divisionLine);

    try {
      const uiSheet = AssetLoader.getSpriteSheet("uiSpriteSheet");
      const backgroundTex =
        uiSheet.textures["Progress_background"] ?? PIXI.Texture.WHITE;
      const fillTex = uiSheet.textures["Progress_fill"] ?? PIXI.Texture.WHITE;

      this.progressFrameTexture = this.buildProgressFrameTexture(uiSheet);

      this.progressBarComponent = new ProgressBarComponent(1024, {
        frame: this.progressFrameTexture,
        background: backgroundTex,
        fill: fillTex,
      });

      this.progressBarComponent.scale.set(0.5);
      this.uiLayer.addChild(this.progressBarComponent);
    } catch (error) {
      ErrorLogger.warn("Error creating progress bar", error);
    }
  }

  private buildProgressFrameTexture(
    uiSheet: PIXI.Spritesheet,
  ): PIXI.RenderTexture {
    const leftTexture =
      uiSheet.textures["Progress_frame_left"] ?? PIXI.Texture.WHITE;
    const centerTexture =
      uiSheet.textures["Progress_frame_middle"] ?? PIXI.Texture.WHITE;
    const rightTexture =
      uiSheet.textures["Progress_frame_right"] ?? PIXI.Texture.WHITE;

    const finalHeight = leftTexture.height;
    const leftWidth = leftTexture.width;
    const rightWidth = rightTexture.width;
    const centerWidth = centerTexture.width;
    const totalWidth = leftWidth + centerWidth + rightWidth;

    const renderTexture = PIXI.RenderTexture.create({
      width: totalWidth,
      height: finalHeight,
      resolution: this.app.renderer.resolution,
    });

    const tempContainer = new PIXI.Container();
    const leftSprite = new PIXI.Sprite(leftTexture);
    const centerSprite = new PIXI.Sprite(centerTexture);
    const rightSprite = new PIXI.Sprite(rightTexture);

    centerSprite.x = leftWidth;
    rightSprite.x = leftWidth + centerWidth;

    tempContainer.addChild(leftSprite, centerSprite, rightSprite);

    this.app.renderer.render(tempContainer, {
      renderTexture,
      clear: true,
    });

    tempContainer.destroy({ children: true });

    return renderTexture;
  }

  onResize(width: number, height: number): void {
    this.layoutHandler.apply(width, height, {
      bg: this.backgroundSprite,
      title: this.titleText,
      sub: this.subText,
      divLine: this.divisionLine,
      progressBar: this.progressBarComponent,
    });

    
    this.app.renderer.render(this.app.stage);
  }

  update(): void {
    const elapsedTimeMs = performance.now() - this.startTime;
    this.displayedLoadProgress = Math.min(
      100,
      (elapsedTimeMs / this.totalExpectedDurationMs) * 100,
    );

    if (this.progressBarComponent) {
      this.progressBarComponent.progress = this.displayedLoadProgress;
    }

    if (
      this.loadingComplete &&
      !this.hasTransitioned &&
      this.displayedLoadProgress >= 100
    ) {
      this.hasTransitioned = true;
      SceneTransitionManager.instance.transitionTo(this.targetSceneId, false);
    }
  }

  onExit(): void {
    this.app.ticker.remove(this.update, this);

    this.backgroundSprite?.destroy();
    this.titleText?.destroy();
    this.subText?.destroy();
    this.divisionLine?.destroy();
    this.progressBarComponent?.destroy();

    this.progressFrameTexture?.destroy(true);
    

    this.backgroundSprite = null;
    this.titleText = null;
    this.subText = null;
    this.divisionLine = null;
    this.progressBarComponent = null;
    this.progressFrameTexture = null;
    this.divisionLineTexture = null;

    this.backgroundLayer.removeChildren();
    this.uiLayer.removeChildren();
  }

  private clearDisplayObjects(): void {
    this.backgroundSprite?.destroy();
    this.titleText?.destroy();
    this.subText?.destroy();
    this.divisionLine?.destroy();
    this.progressBarComponent?.destroy();
    this.progressFrameTexture?.destroy(true);
    

    this.backgroundSprite = null;
    this.titleText = null;
    this.subText = null;
    this.divisionLine = null;
    this.progressBarComponent = null;
    this.progressFrameTexture = null;
    this.divisionLineTexture = null;

    this.backgroundLayer.removeChildren();
    this.uiLayer.removeChildren();
  }

  getContainer(): PIXI.Container {
    return this.container;
  }
}
