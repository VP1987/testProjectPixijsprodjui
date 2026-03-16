import { GameAnimation } from "@/core/cards/animation/AnimationEngine";
import { CardViewModel } from "@/core/cards/components/CardViewModel";
import { AnimationEngine } from "@/core/cards/animation/AnimationEngine";
import { CardFlipAnimation } from "@/core/cards/animation/CardFlipAnimation";
import { cardFlipAnimationDurationSeconds } from "@/features/AceOfShadows/constants";

export type DynamicPos = () => { x: number; y: number };

function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

export class CardFlyAnimation implements GameAnimation {
  private progress = 0;
  private flipped = false;

  constructor(
    private card: CardViewModel,
    private getStartPos: DynamicPos,
    private getEndPos: DynamicPos,
    private duration: number,
    private engine: AnimationEngine,
    private shouldFlip: boolean = true,
  ) {}

  update(dt: number): boolean {
    this.progress += dt / this.duration;
    const t = Math.min(this.progress, 1);

    const start = this.getStartPos();
    const end = this.getEndPos();

    const easedT = easeOutBack(t);

    const x = start.x + (end.x - start.x) * easedT;

    const arcHeight = 120;
    const arc = arcHeight * Math.sin(t * Math.PI);
    const y = start.y + (end.y - start.y) * easedT - arc;

    this.card.sprite.x = x;
    this.card.sprite.y = y;

    if (this.shouldFlip && !this.flipped && t >= 0.5) {
      this.flipped = true;
      this.engine.add(
        new CardFlipAnimation(this.card, cardFlipAnimationDurationSeconds),
      );
    }

    if (t >= 1) {
      this.card.sprite.x = end.x;
      this.card.sprite.y = end.y;
      return true;
    }

    return false;
  }
}
