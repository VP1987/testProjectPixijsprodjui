export interface GameAnimation {
  update(dt: number): boolean;
}

export class AnimationEngine {
  private animations: GameAnimation[] = [];

  add(animation: GameAnimation): void {
    this.animations.push(animation);
  }

  update(dt: number): void {
    if (!dt || dt <= 0) return;

    for (let i = this.animations.length - 1; i >= 0; i--) {
      const anim = this.animations[i];

      const finished = anim.update(dt);

      if (finished) {
        this.animations.splice(i, 1);
      }
    }
  }

  clear(): void {
    this.animations.length = 0;
  }

  get size(): number {
    return this.animations.length;
  }
}
