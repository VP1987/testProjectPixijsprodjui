import * as PIXI from "pixi.js";
import { GameAnimation } from "@/core/cards/animation/AnimationEngine";

export class CardPulseAnimation implements GameAnimation {
  private t: number = 0;
  private duration: number = 0.8;
  private container: PIXI.Container;
  private baseScale: number;
  private isFinished: boolean = false;

  constructor(container: PIXI.Container) {
    this.container = container;
    this.baseScale = container.scale.x;
  }

  public update(dt: number): boolean {
    if (this.isFinished) return true;

    this.t += dt;
    const factor = 1 + Math.sin((this.t / this.duration) * Math.PI * 2) * 0.08;
    this.container.scale.set(this.baseScale * factor);
    
    return false;
  }

  public updateBaseScale(newScale: number): void {
      this.baseScale = newScale;
  }

  public stop(): void {
    this.isFinished = true;
    this.container.scale.set(this.baseScale);
  }
}
