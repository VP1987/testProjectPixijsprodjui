import * as PIXI from "pixi.js";
import { SceneManager } from "@/core/systems/SceneManager";
import { FPSCounter } from "@/core/systems/debug/FPSCounter";
import { ParticleCounter } from "@/core/systems/debug/ParticleCounter";
import { ViewportScaler } from "@/core/systems/ViewportScaler";
import { TextureFactory } from "@/core/infrastructure/TextureFactory";
import { FontManager } from "@/core/infrastructure/FontManager";
import { LoadingScene } from "@/loading/LoadingScene";
import { MenuScene } from "@/menu/MenuScene";
import { AceOfShadowsScene } from "@/features/AceOfShadows/presentation/AceOfShadowsScene";
import { MagicWordsScene } from "@/features/MagicWords/presentation/MagicWordsScene";
import { FlamesOfPhoenixScene } from "@/features/FlamesOfPhoenix/presentation/FlamesOfPhoenixScene";
import { MiniGameScene } from "@/features/MiniGame/presentation/MiniGameScene";
import { SceneTransitionManager } from "@/core/systems/SceneTransitionManager";
import { Pinia, setActivePinia } from "pinia";
import { ErrorLogger } from "@/core/utils/ErrorLogger";
import { AssetManifest } from "@/core/assets/AssetManifest";
import { IFontConfig } from "@/core/types";

export class GameRunner {
  private app: PIXI.Application;
  private sceneManager: SceneManager;
  private fpsCounter: FPSCounter;
  private viewport: ViewportScaler;
  private pinia: Pinia;
  private appDiv: HTMLElement;
  private screenWidth: number = 0;
  private screenHeight: number = 0;
  private animationFrameId: number = -1;

  constructor(pinia: Pinia) {
    this.pinia = pinia;
    setActivePinia(pinia);

    PIXI.settings.ROUND_PIXELS = true;
    PIXI.settings.RESOLUTION = window.devicePixelRatio || 1;

    this.app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000000,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    this.appDiv = document.getElementById("app")!;
    const canvas = this.app.view as HTMLCanvasElement;
    this.appDiv.appendChild(canvas);

    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.imageRendering = "auto";

    TextureFactory.init(this.app.renderer);

    this.viewport = new ViewportScaler(this.app);
    this.sceneManager = new SceneManager();
    SceneTransitionManager.initialize(this.app, this.sceneManager);
    this.fpsCounter = new FPSCounter();

    this.app.stage.addChild(this.sceneManager.getContainer());
    this.app.stage.addChild(this.fpsCounter.getContainer());

    ParticleCounter.init(this.app.stage);

    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;

    this.boot();
  }

  private async boot(): Promise<void> {
    const fontConfigs: IFontConfig[] = [
      {
        id: "menuTitleFont",
        fontFile: "/customFonts/MGF-PinlockPersonalUse.otf",
        fillColor: 0xffdb29,
        outlineColor: 0xfc2e2e,
        size: 150,
      },
      {
        id: "menuSubtitleFont",
        fontFile: "/customFonts/MGF-PinlockPersonalUse.otf",
        fillColor: 0xffdb29,
        outlineColor: 0xfc2e2e,
        size: 80,
      },
      {
        id: "loadingProgressBarFont",
        fontFile: "/customFonts/MGF-PinlockPersonalUse.otf",
        fillColor: 0xffdb29,
        outlineColor: 0x333333,
        size: 50,
      },
    ];

    try {
      await PIXI.Assets.init({
        manifest: AssetManifest,
      });

      await PIXI.Assets.loadBundle("coreAssets");
      await PIXI.Assets.loadBundle("loadingAssets");

      FontManager.initialize(fontConfigs);
      await FontManager.instance.loadAndRegisterFonts();

      this.setupScenes();
      this.handleResize();
      this.setupTicker();
      this.setupResize();

      SceneTransitionManager.instance.transitionTo("menu", true);
    } catch (error) {
      ErrorLogger.critical("Game boot failed", error);
    }
  }

  private setupScenes(): void {
    const nav = (id: Parameters<SceneManager["navigateTo"]>[0]) =>
      SceneTransitionManager.instance.transitionTo(id);

    this.sceneManager.register(
      "loading",
      new LoadingScene(this.app, nav, "menu"),
    );

    this.sceneManager.register("menu", new MenuScene(this.app, nav));

    this.sceneManager.register(
      "aceOfShadows",
      new AceOfShadowsScene(this.app, nav, this.viewport),
    );

    this.sceneManager.register(
      "magicWords",
      new MagicWordsScene(this.app, nav, this.viewport),
    );

    this.sceneManager.register(
      "flamesOfPhoenix",
      new FlamesOfPhoenixScene(this.app, nav, this.viewport),
    );

    this.sceneManager.register(
      "minigame",
      new MiniGameScene(this.app, nav, this.viewport),
    );
  }

  private setupTicker(): void {
    this.app.ticker.add(() => {
      const deltaTime = this.app.ticker.deltaMS / 1000;
      this.sceneManager.update(deltaTime);
      this.fpsCounter.update(this.app.ticker.deltaMS);
      ParticleCounter.update(this.app.screen.width);
    });
  }

  private setupResize(): void {
    const onResizeAction = () => {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = requestAnimationFrame(() => this.handleResize());
    };

    window.addEventListener("resize", onResizeAction);
    window.addEventListener("orientationchange", () =>
      setTimeout(onResizeAction, 250),
    );
  }

  private handleResize(): void {
    const devicePixelRatio = window.devicePixelRatio || 1;

    this.screenWidth = Math.floor(window.innerWidth);
    this.screenHeight = Math.floor(window.innerHeight);

    if (this.app.renderer.resolution !== devicePixelRatio) {
      this.app.renderer.resolution = devicePixelRatio;
    }

    this.app.renderer.resize(this.screenWidth, this.screenHeight);

    const canvas = this.app.view as HTMLCanvasElement;
    canvas.style.width = `${this.screenWidth}px`;
    canvas.style.height = `${this.screenHeight}px`;

    this.sceneManager.onResize(this.screenWidth, this.screenHeight);
  }

  getApp(): PIXI.Application {
    return this.app;
  }
}
