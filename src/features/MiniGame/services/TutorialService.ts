import * as PIXI from "pixi.js";
import { AssetLoader } from "@/core/systems/AssetLoader";
import { ArrowBounceAnimation } from "@/features/MiniGame/animation/ArrowBounceAnimation";
import { AnimationEngine } from "@/core/cards/animation/AnimationEngine";
import { DialogBoxComponent } from "@/features/MiniGame/presentation/components/DialogBoxComponent";
import { MiniGameTutorialLayoutHandler } from "@/features/MiniGame/presentation/layout/MiniGameTutorialLayoutHandler";
import { FireEffect } from "@/features/FlamesOfPhoenix/effects/sparkParticleFly/FireEffect";

export enum TutorialStep {
  None,
  Intro,
  GirlTalk,
  GrannyTalk,
  GirlTalk2,
  HighlightCard4,
  HighlightCard5,
  DrawHighlight,
  Finished,
}

export class TutorialService {
  private container: PIXI.Container;
  private overlay: PIXI.Graphics;
  private girl: PIXI.Sprite;
  private granny: PIXI.Sprite;
  private arrow: PIXI.Sprite;
  private dialogBox: DialogBoxComponent;
  private animationEngine: AnimationEngine;
  private layoutHandler: MiniGameTutorialLayoutHandler;
  private arrowAnimation: ArrowBounceAnimation | null = null;
  private fireEffect: FireEffect | null = null;
  private grannyFireContainer: PIXI.Container;
  public currentStep: TutorialStep = TutorialStep.None;
  private onComplete: () => void;
  private dialogData: any;

  constructor(
    stage: PIXI.Container,
    animationEngine: AnimationEngine,
    app: PIXI.Application,
    onComplete: () => void,
  ) {
    this.container = new PIXI.Container();
    this.container.visible = false;
    this.animationEngine = animationEngine;
    this.onComplete = onComplete;
    this.layoutHandler = new MiniGameTutorialLayoutHandler();

    this.overlay = new PIXI.Graphics();
    this.container.addChild(this.overlay);

    this.girl = new PIXI.Sprite(AssetLoader.getTexture("Little_girl"));
    this.girl.anchor.set(0, 1);

    this.granny = new PIXI.Sprite(AssetLoader.getTexture("Old_granny"));
    this.granny.anchor.set(1, 1);

    this.grannyFireContainer = new PIXI.Container();
    this.container.addChild(this.grannyFireContainer);

    this.arrow = new PIXI.Sprite(AssetLoader.getTexture("Arrow_tut_sign"));
    this.arrow.anchor.set(0.5, 0);

    this.dialogBox = new DialogBoxComponent();
    this.dialogBox.on("pointerdown", (e: PIXI.FederatedPointerEvent) => {
      e.stopPropagation();
      this.nextStep();
    });

    this.container.addChild(this.girl, this.granny, this.arrow, this.dialogBox);
    stage.addChild(this.container);

    this.container.eventMode = "static";
    this.container.on("pointerdown", () => this.nextStep());

    this.fireEffect = new FireEffect(app, this.grannyFireContainer);
    this.fireEffect.setScale(0.5);
  }

  public start(): void {
    this.dialogData = PIXI.Assets.get("tutorialDialogJson");
    this.currentStep = TutorialStep.GirlTalk;
    this.container.visible = true;
    this.updateVisuals();
  }

  private nextStep(): void {
    if (this.currentStep >= TutorialStep.HighlightCard4) return;
    this.currentStep++;
    this.updateVisuals();
  }

  public handleCardClick(value: string): void {
    if (this.currentStep === TutorialStep.HighlightCard4 && value === "4") {
      this.currentStep = TutorialStep.HighlightCard5;
      this.updateVisuals();
    } else if (
      this.currentStep === TutorialStep.HighlightCard5 &&
      value === "5"
    ) {
      this.finish();
    } else if (this.currentStep === TutorialStep.DrawHighlight) {
      this.finish();
    }
  }

  public triggerDrawTutorial(): void {
    this.currentStep = TutorialStep.DrawHighlight;
    this.container.visible = true;
    this.updateVisuals();
  }

  public updateVisuals(highlightBounds?: PIXI.Rectangle): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const isPortrait = h > w;

    this.layoutHandler.apply(
      w,
      h,
      {
        girl: this.girl,
        granny: this.granny,
        dialogBox: this.dialogBox,
        arrow: this.arrow,
        bubble: new PIXI.Sprite(),
      },
      this.currentStep,
    );

    this.overlay.clear();
    this.overlay.beginFill(0x000000, 0.4);

    if (
      highlightBounds &&
      (this.currentStep === TutorialStep.HighlightCard4 ||
        this.currentStep === TutorialStep.HighlightCard5 ||
        this.currentStep === TutorialStep.DrawHighlight)
    ) {
      this.overlay.drawRect(0, 0, w, h);
      this.overlay.beginHole();
      this.overlay.drawRoundedRect(
        highlightBounds.x - 5,
        highlightBounds.y - 5,
        highlightBounds.width + 10,
        highlightBounds.height + 10,
        10,
      );
      this.overlay.endHole();
    } else {
      this.overlay.drawRect(0, 0, w, h);
    }
    this.overlay.endFill();

    this.girl.visible = false;
    this.granny.visible = false;
    this.arrow.visible = false;
    this.dialogBox.visible = false;
    this.grannyFireContainer.visible = false;
    this.container.eventMode = "static";

    const stepIndex = this.currentStep - TutorialStep.GirlTalk;

    switch (this.currentStep) {
      case TutorialStep.GirlTalk:
      case TutorialStep.GrannyTalk:
      case TutorialStep.GirlTalk2:
        const data = this.dialogData?.steps[Math.max(0, stepIndex)];
        if (data) {
          this.dialogBox.setData(data.name, data.text);
          this.dialogBox.visible = true;
          this.dialogBox.setFlip(data.characterId === 2);

          if (data.characterId === 2) {
            this.dialogBox.x -= 40;
          }

          this.girl.visible = true;
          this.girl.tint = data.characterId === 1 ? 0xffffff : 0x888888;

          this.granny.visible = true;
          this.granny.tint = data.characterId === 2 ? 0xffffff : 0x888888;

          if (data.characterId === 2) {
            this.grannyFireContainer.visible = true;
            const grannyBounds = this.granny.getBounds();
            this.fireEffect?.setPosition(
              grannyBounds.x + grannyBounds.width * 0.2 - 30,
              grannyBounds.y + grannyBounds.height * 0.2 + 20,
            );
          }
        }
        break;

      case TutorialStep.HighlightCard4:
      case TutorialStep.HighlightCard5:
      case TutorialStep.DrawHighlight:
        this.container.eventMode = "none";
        this.arrow.visible = true;

        const isTooHigh = highlightBounds ? highlightBounds.y < 200 : false;

        if (isTooHigh || isPortrait) {
          this.arrow.rotation = 0;
          this.arrow.scale.set(0.35);
        } else {
          this.arrow.rotation = Math.PI;
          this.arrow.scale.set(0.5);
        }

        if (!this.arrowAnimation) {
          this.arrowAnimation = new ArrowBounceAnimation();
          this.animationEngine.add(this.arrowAnimation);
        }
        break;
    }
  }

  public update(dt: number): void {
    if (this.fireEffect && this.grannyFireContainer.visible) {
      this.fireEffect.update(dt);
    }
  }

  public updateTutAssets(
    targetX: number,
    targetY: number,
    targetH: number,
  ): void {
    if (this.arrow.visible) {
      const h = window.innerHeight;
      const w = window.innerWidth;
      const bounce = this.arrowAnimation ? this.arrowAnimation.offset : 0;
      const isTooHigh = targetY < 200;

      if (isTooHigh || h > w) {
        this.arrow.rotation = Math.PI;
        this.arrow.anchor.set(0.5, 0.5);
        this.arrow.position.set(
          targetX,
          targetY + targetH / 2 + this.arrow.height / 2 + Math.abs(bounce),
        );
      } else {
        this.arrow.rotation = 0;
        this.arrow.anchor.set(0.5, 0.5);
        this.arrow.position.set(
          targetX,
          targetY - targetH / 2 - this.arrow.height / 2 - Math.abs(bounce),
        );
      }
    }
  }

  private finish(): void {
    this.container.visible = false;
    this.currentStep = TutorialStep.Finished;
    this.onComplete();
  }

  public isHighlightMode(): boolean {
    return (
      this.currentStep === TutorialStep.HighlightCard4 ||
      this.currentStep === TutorialStep.HighlightCard5 ||
      this.currentStep === TutorialStep.DrawHighlight
    );
  }
}
