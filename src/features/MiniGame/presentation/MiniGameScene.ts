import * as PIXI from "pixi.js";
import type {
  IScene,
  NavigateFn,
  SceneId,
  CardTextures,
} from "@/core/types/index";
import { ViewportScaler } from "@/core/systems/ViewportScaler";
import { CardFactory } from "@/core/cards/factories/CardFactory";
import { CardViewModel } from "@/core/cards/components/CardViewModel";
import { AnimationEngine } from "@/core/cards/animation/AnimationEngine";
import { AssetLoader } from "@/core/systems/AssetLoader";
import { MiniGameLayoutManager } from "@/features/MiniGame/presentation/layout/MiniGameLayoutManager";
import { MiniGameController } from "@/features/MiniGame/services/MiniGameController";
import { useMiniGameStore } from "@/features/MiniGame/store/MiniGameStore";
import { GameSceneButton } from "@/core/ui/GameSceneButton";
import { CardTextureFactory } from "@/core/cards/factories/CardTextureFactory";
import {
  SolitaireLogic,
  INITIAL_TABLEAU_NODES,
} from "@/features/MiniGame/domain/SolitaireLogic";
import { BitmapTextComponent } from "@/core/ui/BitmapTextComponent";
import { CardStackManager } from "@/core/cards/deck/CardStackManager";
import {
  cardFlyAnimationDurationSeconds,
  cardFlipAnimationDurationSeconds,
} from "@/features/MiniGame/constants";
import { TextWinAnimation } from "@/features/MiniGame/animation/TextWinAnimation";
import { MiniGameUiLayoutHandler } from "@/features/MiniGame/presentation/layout/MiniGameUiLayoutHandler";
import {
  TutorialService,
  TutorialStep,
} from "@/features/MiniGame/services/TutorialService";
import { CardPulseAnimation } from "@/features/MiniGame/animation/CardPulseAnimation";
import { FontManager } from "@/core/infrastructure/FontManager";
import { LocalFonts } from "@/features/MiniGame/fonts/LocalFonts";

export class MiniGameScene implements IScene {
  private readonly container: PIXI.Container;
  private gameContainer!: PIXI.Container;
  private cardLayer!: PIXI.Container;
  private debugLayer!: PIXI.Container;
  private winLayer!: PIXI.Container;
  private backgroundLayer!: PIXI.Container;
  private tutorialLayer!: PIXI.Container;
  private bg: PIXI.Sprite;
  private videoSprite: PIXI.Sprite | null = null;
  private cardTextures: CardTextures | null = null;

  private app: PIXI.Application;
  private viewport: ViewportScaler;
  private navigate: NavigateFn;

  private cardFactory = new CardFactory();
  private animationEngine = new AnimationEngine();
  private stackManager: CardStackManager;
  private tutorialService: TutorialService | null = null;
  private cardPulseAnimation: CardPulseAnimation | null = null;

  private layoutManager: MiniGameLayoutManager;
  private uiLayoutHandler: MiniGameUiLayoutHandler;
  private miniGameController!: MiniGameController;
  private miniGameStore!: ReturnType<typeof useMiniGameStore>;
  private menuButton!: GameSceneButton;
  private goalText!: BitmapTextComponent;
  private winTitle!: BitmapTextComponent;
  private winSubtitle!: BitmapTextComponent;
  private winAnimationShown: boolean = false;
  private videoPlaying: boolean = false;
  private isTutorialActive: boolean = true;
  private drawTutorialTriggered: boolean = false;

  constructor(
    app: PIXI.Application,
    navigate: NavigateFn,
    viewport: ViewportScaler,
  ) {
    this.app = app;
    this.navigate = navigate;
    this.viewport = viewport;
    this.container = new PIXI.Container();

    const stackIds = [
      "drawPile",
      "activePile",
      ...INITIAL_TABLEAU_NODES.map((_, i) => `tableau-${i}`),
    ];
    this.stackManager = new CardStackManager(stackIds);

    this.backgroundLayer = new PIXI.Container();
    this.container.addChild(this.backgroundLayer);

    this.bg = new PIXI.Sprite();
    this.bg.anchor.set(0.5);
    this.backgroundLayer.addChild(this.bg);

    this.gameContainer = new PIXI.Container();
    this.container.addChild(this.gameContainer);

    this.layoutManager = new MiniGameLayoutManager();
    this.uiLayoutHandler = new MiniGameUiLayoutHandler();

    this.cardLayer = new PIXI.Container();
    this.gameContainer.addChild(this.cardLayer);

    this.debugLayer = new PIXI.Container();
    this.container.addChild(this.debugLayer);

    this.winLayer = new PIXI.Container();
    this.container.addChild(this.winLayer);

    this.tutorialLayer = new PIXI.Container();
    this.container.addChild(this.tutorialLayer);

    this.menuButton = new GameSceneButton(80, 110);
    this.menuButton.onMenuClick = () => navigate("menu");
  }

  async onEnter(): Promise<void> {
    this.app.stage.addChild(this.menuButton);
    this.menuButton.visible = true;
    this.miniGameStore = useMiniGameStore();

    await FontManager.instance.loadAndRegisterFonts(LocalFonts);

    this.miniGameController = new MiniGameController(
      this.animationEngine,
      this.cardLayer,
      this.miniGameStore,
      this.stackManager,
      () => ({
        x: this.layoutManager.activePilePos.x,
        y: this.layoutManager.activePilePos.y,
      }),
      {
        flyDuration: cardFlyAnimationDurationSeconds,
        flipDuration: cardFlipAnimationDurationSeconds,
      },
    );

    try {
      await PIXI.Assets.loadBundle("minigameAssets");
      await PIXI.Assets.loadBundle("aceOfShadowsAssets");
      await PIXI.Assets.loadBundle("flamesOfPhoenixAssets");

      this.bg.texture = AssetLoader.getTexture("backgroundMiniGame");

      const videoTexture = PIXI.Assets.get("winVideo");
      if (videoTexture && !this.videoSprite) {
        this.videoSprite = new PIXI.Sprite(videoTexture);
        this.videoSprite.anchor.set(0.5);
        this.videoSprite.visible = false;
        this.backgroundLayer.addChild(this.videoSprite);
      }

      if (!this.miniGameStore.isBuilt) {
        this.cardTextures = CardTextureFactory.create();

        this.goalText = new BitmapTextComponent(
          "menuSubtitleFont",
          "GOAL: 18",
          true,
        );
        this.goalText.scale.set(0.5);
        this.debugLayer.addChild(this.goalText);

        const logicalSize = this.viewport.getLogicalSize();
        this.buildScene(logicalSize.width, logicalSize.height);

        this.tutorialService = new TutorialService(
          this.tutorialLayer,
          this.animationEngine,
          this.app,
          () => {
            this.isTutorialActive = false;
            this.stopPulse();
            this.miniGameController.getTableau().forEach((t) => {
              (t.viewModel.sprite as PIXI.Sprite).tint = 0xffffff;
            });
          },
        );

        this.isTutorialActive = true;
        this.tutorialService.start();
      }

      this.onResize(window.innerWidth, window.innerHeight);
    } catch (error) {}
  }

  private buildScene(w: number, h: number): void {
    if (this.miniGameStore.isBuilt) return;

    this.layoutManager.computeAndSyncLayout({ width: w, height: h });

    if (!this.cardTextures) return;

    const deckEntities = SolitaireLogic.generateDeck();

    const cards: CardViewModel[] = deckEntities.map((entity) => {
      const card = this.cardFactory.createCard(
        entity.id,
        entity.suit,
        entity.value,
        this.cardTextures!.back,
        this.cardTextures!.face,
        this.cardTextures!.ranks[entity.value],
        this.cardTextures!.suits[entity.suit],
      );

      card.sprite.eventMode = "static";
      card.sprite.cursor = "pointer";

      card.sprite.on("pointerdown", () => {
        if (this.videoPlaying) return;

        if (this.isTutorialActive && this.tutorialService) {
          if (!this.tutorialService.isHighlightMode()) return;

          const step = this.tutorialService.currentStep;
          let targetValue = "";
          if (step === TutorialStep.HighlightCard4) targetValue = "4";
          else if (step === TutorialStep.HighlightCard5) targetValue = "5";
          else if (step === TutorialStep.DrawHighlight) {
            const drawTop = this.miniGameController.getDrawPile().slice(-1)[0];
            if (card === drawTop) {
              this.stopPulse();
              this.tutorialService.handleCardClick("");
              this.miniGameController.handleDrawClick();
            }
            return;
          }

          if (card.entity.value !== targetValue) return;

          this.stopPulse();
          this.tutorialService.handleCardClick(card.entity.value);
        }

        const tableauInfo = this.miniGameController
          .getTableau()
          .find((t) => t.viewModel === card);
        if (tableauInfo) {
          const index = INITIAL_TABLEAU_NODES.findIndex(
            (n) => n.id === tableauInfo.node.id,
          );
          this.miniGameController.handleTableauClick(index);
        } else if (this.miniGameController.getDrawPile().includes(card)) {
          this.miniGameController.handleDrawClick();
        }
      });

      this.cardLayer.addChild(card.sprite);
      return card;
    });

    this.miniGameController.initializeGame(cards);
    this.miniGameController
      .getDrawPile()
      .forEach((c) => (c.sprite.visible = false));
  }

  private stopPulse(): void {
    if (this.cardPulseAnimation) {
      this.cardPulseAnimation.stop();
      this.cardPulseAnimation = null;
    }
  }

  onResize(screenWidth: number, screenHeight: number): void {
    if (!this.miniGameStore.isBuilt) return;

    const backgroundSprites = [this.bg];
    if (this.videoSprite) backgroundSprites.push(this.videoSprite);

    backgroundSprites.forEach((sprite) => {
      if (sprite && sprite.texture) {
        sprite.x = screenWidth / 2;
        sprite.y = screenHeight / 2;
        sprite.scale.set(
          Math.max(
            screenWidth / sprite.texture.width,
            screenHeight / sprite.texture.height,
          ),
        );
      }
    });

    const scaleData = this.viewport.getScaleData(screenWidth, screenHeight);
    this.gameContainer.scale.set(scaleData.scale);
    this.gameContainer.position.set(scaleData.offsetX, scaleData.offsetY);

    const logical = this.viewport.getLogicalSize();
    if (!this.cardTextures) return;

    this.layoutManager.apply(
      logical,
      this.cardTextures.back.width,
      this.miniGameController.getTableau(),
      this.miniGameController.getDrawPile(),
      this.miniGameController.getActivePile(),
      this.cardLayer,
    );

    const currentCardScale =
      this.layoutManager.cardW / this.cardTextures.back.width;
    if (this.cardPulseAnimation) {
      this.cardPulseAnimation.updateBaseScale(currentCardScale);
    }

    if (this.goalText) {
      this.goalText.position.set(
        screenWidth - this.goalText.width - 20,
        10 + 14 + 20,
      );
    }

    if (this.winAnimationShown && this.winTitle && this.winSubtitle) {
      this.winLayer.position.set(screenWidth / 2, screenHeight / 2);
      this.uiLayoutHandler.apply(screenWidth, screenHeight, {
        title: this.winTitle,
        sub: this.winSubtitle,
      });
    }

    if (this.isTutorialActive && this.tutorialService) {
      this.tutorialService.updateVisuals();
    }

    this.menuButton.resize(screenWidth, screenHeight);
    this.animationEngine.update(0.001);
    this.app.renderer.render(this.app.stage);
  }

  update(dt: number): void {
    if (this.animationEngine) this.animationEngine.update(dt);

    const tableauCount = this.miniGameController.getTableau().length;
    if (this.goalText) this.goalText.text = `GOAL: ${tableauCount}`;

    if (this.isTutorialActive && this.tutorialService) {
      this.tutorialService.update(dt);
      const step = this.tutorialService.currentStep;
      let highlightRect: PIXI.Rectangle | undefined;

      if (
        step === TutorialStep.HighlightCard4 ||
        step === TutorialStep.HighlightCard5
      ) {
        const targetValue = step === TutorialStep.HighlightCard4 ? "4" : "5";
        this.miniGameController.getTableau().forEach((t) => {
          const isTarget = t.viewModel.entity.value === targetValue;
          (t.viewModel.sprite as PIXI.Sprite).tint = isTarget
            ? 0xffffff
            : 0x666666;
          if (isTarget) {
            const globalPos = t.viewModel.sprite.getGlobalPosition();
            const bounds = t.viewModel.sprite.getBounds();
            highlightRect = new PIXI.Rectangle(
              bounds.x,
              bounds.y,
              bounds.width,
              bounds.height,
            );
            this.tutorialService!.updateTutAssets(
              globalPos.x,
              globalPos.y,
              this.layoutManager.cardH,
            );
            if (
              !this.cardPulseAnimation ||
              (this.cardPulseAnimation as any).targetCard !== t.viewModel
            ) {
              this.stopPulse();
              this.cardPulseAnimation = new CardPulseAnimation(
                t.viewModel.sprite,
              );
              (this.cardPulseAnimation as any).targetCard = t.viewModel;
              this.animationEngine.add(this.cardPulseAnimation);
            }
          }
        });
      } else if (step === TutorialStep.DrawHighlight) {
        const drawTop = this.miniGameController.getDrawPile().slice(-1)[0];
        if (drawTop) {
          drawTop.sprite.visible = true;
          (drawTop.sprite as PIXI.Sprite).tint = 0xffffff;
          const globalPos = drawTop.sprite.getGlobalPosition();
          const bounds = drawTop.sprite.getBounds();
          highlightRect = new PIXI.Rectangle(
            bounds.x,
            bounds.y,
            bounds.width,
            bounds.height,
          );
          this.tutorialService!.updateTutAssets(
            globalPos.x,
            globalPos.y,
            this.layoutManager.cardH,
          );
          if (
            !this.cardPulseAnimation ||
            (this.cardPulseAnimation as any).targetCard !== drawTop
          ) {
            this.stopPulse();
            this.cardPulseAnimation = new CardPulseAnimation(drawTop.sprite);
            (this.cardPulseAnimation as any).targetCard = drawTop;
            this.animationEngine.add(this.cardPulseAnimation);
          }
        }
        this.miniGameController.getTableau().forEach((t) => {
          (t.viewModel.sprite as PIXI.Sprite).tint = 0x666666;
        });
      } else {
        this.miniGameController.getTableau().forEach((t) => {
          (t.viewModel.sprite as PIXI.Sprite).tint = 0x666666;
        });
      }

      this.tutorialService.updateVisuals(highlightRect);
    } else {
      this.miniGameController.getDrawPile().forEach((c) => {
        if (!this.drawTutorialTriggered) c.sprite.visible = false;
      });
    }

    if (
      !this.isTutorialActive &&
      !this.drawTutorialTriggered &&
      this.miniGameController.getTableau().length > 0
    ) {
      const activePile = this.miniGameController.getActivePile();
      const activeCard = activePile[activePile.length - 1];
      if (activeCard) {
        const hasMatch = this.miniGameController.getTableau().some((t) => {
          const isCovered = t.node.coveredBy.some(
            (covId) =>
              this.stackManager.getStack(`tableau-${covId}`).length > 0,
          );
          return (
            !isCovered &&
            SolitaireLogic.isMatch(
              t.viewModel.entity.value,
              activeCard.entity.value,
            )
          );
        });

        if (!hasMatch) {
          this.drawTutorialTriggered = true;
          this.isTutorialActive = true;
          if (this.tutorialService) {
            this.tutorialService.triggerDrawTutorial();
            this.miniGameController
              .getDrawPile()
              .forEach((c) => (c.sprite.visible = true));
          }
        }
      }
    }

    if (
      tableauCount === 0 &&
      !this.winAnimationShown &&
      this.miniGameStore.isBuilt
    ) {
      this.showWinAnimation();
    }
  }

  private showWinAnimation(): void {
    this.winAnimationShown = true;
    this.winLayer.removeChildren();
    this.winLayer.position.set(window.innerWidth / 2, window.innerHeight / 2);
    this.winTitle = new BitmapTextComponent(
      "menuTitleFont",
      "Congratulations",
      true,
    );
    this.winSubtitle = new BitmapTextComponent(
      "menuSubtitleFont",
      "You helped Benji get the treats!",
      true,
    );
    this.winLayer.addChild(this.winTitle, this.winSubtitle);
    this.uiLayoutHandler.apply(window.innerWidth, window.innerHeight, {
      title: this.winTitle,
      sub: this.winSubtitle,
    });
    this.winLayer.eventMode = "static";
    this.winLayer.cursor = "pointer";
    this.winLayer.once("pointerdown", () => this.playWinVideo());
    this.animationEngine.add(new TextWinAnimation(this.winLayer));
  }

  private playWinVideo(): void {
    if (!this.videoSprite) return;
    this.videoPlaying = true;
    this.gameContainer.visible = false;
    this.debugLayer.visible = false;
    this.winLayer.visible = false;
    this.videoSprite.visible = true;

    const videoResource = this.videoSprite.texture.baseTexture
      .resource as PIXI.VideoResource;
    const videoSource = videoResource.source as HTMLVideoElement;

    if (videoSource) {
      videoSource.play().catch((e) => console.error(e));
      videoSource.onended = () => {
        this.videoPlaying = false;
        this.navigate("menu");
      };
    }
  }

  getContainer(): PIXI.Container {
    return this.container;
  }

  onExit(): void {
    if (this.videoSprite) {
      const videoResource = this.videoSprite.texture.baseTexture
        .resource as PIXI.VideoResource;
      const videoSource = videoResource.source as HTMLVideoElement;

      if (videoSource) {
        videoSource.pause();
        videoSource.onended = null;
      }
      this.videoSprite.destroy();
      this.videoSprite = null;
    }

    this.menuButton.visible = false;
    if (this.menuButton.parent)
      this.menuButton.parent.removeChild(this.menuButton);

    this.animationEngine.clear();

    if (this.cardLayer) {
      this.cardLayer
        .removeChildren()
        .forEach((child) => child.destroy({ children: true }));
    }

    if (this.debugLayer) {
      this.debugLayer.removeChildren();
    }

    if (this.winLayer) {
      this.winLayer.removeChildren();
    }

    if (this.tutorialLayer) {
      this.tutorialLayer
        .removeChildren()
        .forEach((child) => child.destroy({ children: true }));
    }

    this.cardTextures = null;
    this.winAnimationShown = false;
    this.videoPlaying = false;
    this.isTutorialActive = false;
    this.drawTutorialTriggered = false;
    this.tutorialService = null;

    if (this.miniGameStore) {
      this.miniGameStore.resetGame();
    }

    this.gameContainer.visible = true;
    this.debugLayer.visible = true;

    const stackIds = [
      "drawPile",
      "activePile",
      ...INITIAL_TABLEAU_NODES.map((_, i) => `tableau-${i}`),
    ];
    this.stackManager = new CardStackManager(stackIds);
  }
}
