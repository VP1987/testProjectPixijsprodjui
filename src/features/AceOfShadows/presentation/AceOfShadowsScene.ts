import * as PIXI from "pixi.js";
import type {
  IScene,
  NavigateFn,
  SceneId,
  CardTextures,
} from "@/core/types/index";
import { ViewportScaler } from "@/core/systems/ViewportScaler";
import { CardFactory } from "@/core/cards/factories/CardFactory";
import { CardDeckBuilder } from "@/core/cards/deck/CardDeckBuilder";
import { CardViewModel } from "@/core/cards/components/CardViewModel";
import { CardStackManager } from "@/core/cards/deck/CardStackManager";
import { AnimationEngine } from "@/core/cards/animation/AnimationEngine";
import { AssetLoader } from "@/core/systems/AssetLoader";
import { AceOfShadowsLayoutManager } from "@/features/AceOfShadows/presentation/layout/AceOfShadowsLayoutManager";
import { CardMovementService } from "@/features/AceOfShadows/services/CardMovementService";
import { GameLoopService } from "@/features/AceOfShadows/services/GameLoopService";
import { useAceOfShadowsStore } from "@/features/AceOfShadows/store/AceOfShadowsStore";
import { GameSceneButton } from "@/core/ui/GameSceneButton";
import { CardTextureFactory } from "@/core/cards/factories/CardTextureFactory";
import { cardFlyAnimationDurationSeconds } from "@/features/AceOfShadows/constants";

export class AceOfShadowsScene implements IScene {
  private readonly container: PIXI.Container;
  private gameContainer!: PIXI.Container;
  private cardLayer!: PIXI.Container;
  private placeholderLayer!: PIXI.Container;
  private bg: PIXI.Sprite;
  private cardTextures: CardTextures | null = null;

  private app: PIXI.Application;
  private viewport: ViewportScaler;

  private cardFactory = new CardFactory();
  private stackManager = new CardStackManager(["stackA", "stackB"]);
  private animationEngine = new AnimationEngine();

  private layoutManager: AceOfShadowsLayoutManager;
  private cardMovementService!: CardMovementService;
  private gameLoopService!: GameLoopService;
  private aceOfShadowsStore!: ReturnType<typeof useAceOfShadowsStore>;
  private menuButton!: GameSceneButton;

  constructor(
    app: PIXI.Application,
    navigate: NavigateFn,
    viewport: ViewportScaler,
  ) {
    this.app = app;
    this.viewport = viewport;
    this.container = new PIXI.Container();

    this.bg = new PIXI.Sprite();
    this.bg.anchor.set(0.5);
    this.container.addChild(this.bg);

    this.gameContainer = new PIXI.Container();
    this.container.addChild(this.gameContainer);

    this.placeholderLayer = new PIXI.Container();
    this.gameContainer.addChild(this.placeholderLayer);

    const initialPlaceholderA = new PIXI.Graphics();
    const initialPlaceholderB = new PIXI.Graphics();

    this.layoutManager = new AceOfShadowsLayoutManager(
      this.stackManager,
      this.placeholderLayer,
      initialPlaceholderA,
      initialPlaceholderB,
    );

    this.cardLayer = new PIXI.Container();
    this.gameContainer.addChild(this.cardLayer);

    this.cardMovementService = new CardMovementService(
      this.stackManager,
      this.animationEngine,
      this.cardLayer,
      () => ({
        x: this.layoutManager.stackBPos.x,
        y: this.layoutManager.stackBPos.y,
      }),
      {
        flyDuration: cardFlyAnimationDurationSeconds
      }
    );

    this.menuButton = new GameSceneButton(80, 110);
    this.menuButton.onMenuClick = () => navigate("menu");
  }

  async onEnter(): Promise<void> {
    this.app.stage.addChild(this.menuButton);
    this.menuButton.visible = true;
    this.aceOfShadowsStore = useAceOfShadowsStore();

    try {
      await PIXI.Assets.loadBundle("aceOfShadowsAssets");

      this.bg.texture = AssetLoader.getTexture("backgroundAces");

      if (!this.aceOfShadowsStore.isBuilt) {
        this.cardTextures = CardTextureFactory.create();

        this.gameLoopService = new GameLoopService(
          this.animationEngine,
          this.cardMovementService,
          this.aceOfShadowsStore,
          this.stackManager,
        );

        const logicalSize = this.viewport.getLogicalSize();
        this.buildScene(logicalSize.width, logicalSize.height);
      }

      this.onResize(window.innerWidth, window.innerHeight);
    } catch (error) {
      console.error("Failed to load Ace of Shadows assets", error);
    }
  }

  private buildScene(w: number, h: number): void {
    if (this.aceOfShadowsStore.isBuilt) return;

    this.layoutManager.computeAndSyncLayout({ width: w, height: h });
    this.placeholderLayer.removeChildren();
    this.layoutManager.initializePlaceholders(w, h);
    this.layoutManager.updatePlaceholders();

    const tempStackA: CardViewModel[] = [];
    if (!this.cardTextures) {
      throw new Error("Card textures are not set in the scene.");
    }

    CardDeckBuilder.buildStack(
      tempStackA,
      this.cardLayer,
      this.layoutManager.stackAPos,
      this.aceOfShadowsStore.totalCards,
      this.cardFactory,
      this.cardTextures.back,
      this.cardTextures.face,
      this.cardTextures.ranks,
      this.cardTextures.suits,
      this.layoutManager.cardW,
      this.layoutManager.cardH,
    );

    this.stackManager.initStack("stackA", tempStackA);
    this.stackManager.initStack("stackB", []);
    this.aceOfShadowsStore.markAsBuilt();
  }

  onResize(screenWidth: number, screenHeight: number): void {
    if (!this.aceOfShadowsStore.isBuilt) return;

    if (this.bg && this.bg.texture) {
      this.bg.x = screenWidth / 2;
      this.bg.y = screenHeight / 2;

      const bgScale = Math.max(
        screenWidth / this.bg.texture.width,
        screenHeight / this.bg.texture.height,
      );
      this.bg.scale.set(bgScale);
    }

    const scaleData = this.viewport.getScaleData(screenWidth, screenHeight);
    this.gameContainer.scale.set(scaleData.scale);
    this.gameContainer.position.set(scaleData.offsetX, scaleData.offsetY);

    const logical = this.viewport.getLogicalSize();

    if (!this.cardTextures) {
      throw new Error("Card textures are not set in the scene for resize.");
    }

    this.layoutManager.apply(logical, this.cardTextures.back.width);

    this.menuButton.resize(screenWidth, screenHeight);

    this.animationEngine.update(0.001);

    this.app.renderer.render(this.app.stage);
  }

  update(dt: number): void {
    if (this.gameLoopService) {
      this.gameLoopService.update(dt);
    }
  }

  getContainer(): PIXI.Container {
    return this.container;
  }

  onExit(): void {
    this.menuButton.visible = false;
    if (this.menuButton.parent) {
      this.menuButton.parent.removeChild(this.menuButton);
    }

    this.animationEngine.clear();

    if (this.cardLayer) {
      this.cardLayer
        .removeChildren()
        .forEach((child) => child.destroy({ children: true }));
    }

    if (this.placeholderLayer) {
      this.placeholderLayer
        .removeChildren()
        .forEach((child) => child.destroy({ children: true }));
    }

    this.cardTextures = null;

    if (this.aceOfShadowsStore) {
      this.aceOfShadowsStore.$reset();
    }
  }
}
