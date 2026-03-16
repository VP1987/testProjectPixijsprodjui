import * as PIXI from "pixi.js";
import { GameAnimation } from "@/core/cards/animation/AnimationEngine";

export class TextWinAnimation implements GameAnimation {
  private t: number = 0;
  private duration: number = 1.5;
  private container: PIXI.Container;
  private isFinished: boolean = false;
  private startScale: number = 0.1;
  private targetScale: number = 1;

  constructor(container: PIXI.Container) {
    this.container = container;
    this.container.scale.set(this.startScale);
    this.container.alpha = 0;
  }

  public update(dt: number): boolean {
    this.t += dt;
    const progress = Math.min(this.t / this.duration, 1);

    const ease = this.easeOutElastic(progress);
    this.container.scale.set(this.startScale + (this.targetScale - this.startScale) * ease);
    this.container.alpha = Math.min(progress * 4, 1);

    if (progress >= 1) {
      this.isFinished = true;
      this.container.scale.set(this.targetScale);
      this.container.alpha = 1;
    }

    return this.isFinished;
  }

  private easeOutElastic(x: number): number {
    const c4 = (2 * Math.PI) / 3;
    return x === 0
      ? 0
      : x === 1
      ? 1
      : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  }
}
