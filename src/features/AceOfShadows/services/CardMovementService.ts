import * as PIXI from "pixi.js";
import { CardStackManager } from "@/core/cards/deck/CardStackManager";
import { AnimationEngine } from "@/core/cards/animation/AnimationEngine";
import { CardFlyAnimation } from "@/core/cards/animation/CardFlyAnimation";
import { cardFlyAnimationDurationSeconds, cardStackYOffsetPx } from "@/features/AceOfShadows/constants";

export interface AceOfShadowsConfig {
  flyDuration: number;
}

export class CardMovementService {
  private cardStackManager: CardStackManager;
  private animationEngine: AnimationEngine;
  private cardLayer: PIXI.Container;
  private getStackBPosition: () => { x: number; y: number };
  private config: AceOfShadowsConfig;

  constructor(
    cardStackManager: CardStackManager,
    animationEngine: AnimationEngine,
    cardLayer: PIXI.Container,
    getStackBPosition: () => { x: number; y: number },
    config: AceOfShadowsConfig
  ) {
    this.cardStackManager = cardStackManager;
    this.animationEngine = animationEngine;
    this.cardLayer = cardLayer;
    this.getStackBPosition = getStackBPosition;
    this.config = config;
  }

  public moveCard(): void {
    const card = this.cardStackManager.popCard("stackA");
    if (!card) return;

    if (card.entity.isFaceUp) {
      card.entity.isFaceUp = false;
      card.sync();
    }

    const startX = card.sprite.x;
    const startY = card.sprite.y;

    this.cardStackManager.pushCard("stackB", card);
    const targetIdx = this.cardStackManager.getStack("stackB").length - 1;

    this.cardLayer.addChild(card.sprite);

    this.animationEngine.add(
      new CardFlyAnimation(
        card,
        () => ({ x: startX, y: startY }),
        () => {
          const currentBPos = this.getStackBPosition();
          return {
            x: currentBPos.x,
            y: currentBPos.y - targetIdx * cardStackYOffsetPx,
          };
        },
        this.config.flyDuration,
        this.animationEngine,
        true
      ),
    );
  }
}
