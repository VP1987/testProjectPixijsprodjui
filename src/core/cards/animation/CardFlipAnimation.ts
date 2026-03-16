import * as PIXI from "pixi.js";
import { GameAnimation } from "@/core/cards/animation/AnimationEngine";
import { CardViewModel } from "@/core/cards/components/CardViewModel";
import { cardFlipAnimationDurationSeconds } from "@/features/AceOfShadows/constants";

function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

export class CardFlipAnimation implements GameAnimation {
  private t = 0;
  private flipped = false;

  constructor(
    private card: CardViewModel,
    private duration = 0.4,
  ) {}

  update(dt: number): boolean {
    const container = this.card.sprite;
    const currentBaseScale = container.scale.y;

    this.t += dt;
    const progress = Math.min(this.t / this.duration, 1);

    if (progress < 0.5) {
      const localT = progress * 2;
      const squash = 1 - localT;
      container.scale.x = Math.max(0.01, squash) * currentBaseScale;
    } else {
      if (!this.flipped) {
        this.flipped = true;
        this.card.entity.flip();
        this.card.sync();
      }

      const localT = (progress - 0.5) * 2;
      const smoothedGrow = easeOutBack(localT);
      container.scale.x = smoothedGrow * currentBaseScale;
    }

    if (progress >= 1) {
      container.scale.x = currentBaseScale;
    }

    return progress >= 1;
  }
}
