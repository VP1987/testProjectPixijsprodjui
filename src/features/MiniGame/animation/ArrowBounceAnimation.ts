import * as PIXI from "pixi.js";
import { GameAnimation } from "@/core/cards/animation/AnimationEngine";

export class ArrowBounceAnimation implements GameAnimation {
  private t: number = 0;
  private duration: number = 0.8;
  public offset: number = 0;

  public update(dt: number): boolean {
    this.t += dt;
    this.offset = Math.sin((this.t / this.duration) * Math.PI * 2) * 10;
    return false;
  }
}
