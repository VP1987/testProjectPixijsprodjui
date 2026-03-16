import * as PIXI from "pixi.js";

type TrackedEmitter = {
  getParticleCount(): number;
};

export class ParticleCounter {
  private static text: PIXI.Text;
  private static container: PIXI.Container;
  private static trackedEmitters: TrackedEmitter[] = [];

  public static init(stage: PIXI.Container): void {
    this.container = new PIXI.Container();
    this.text = new PIXI.Text("", {
      fontFamily: "monospace",
      fontSize: 14,
      fill: 0xffffff,
      align: "right",
    });
    this.text.anchor.set(1, 0);
    this.text.position.set(window.innerWidth - 10, 10);
    this.container.addChild(this.text);
    stage.addChild(this.container);
  }

  public static register(emitter: TrackedEmitter): void {
    if (!this.trackedEmitters.includes(emitter)) {
      this.trackedEmitters.push(emitter);
    }
  }

  public static unregister(emitter: TrackedEmitter): void {
    const index = this.trackedEmitters.indexOf(emitter);
    if (index > -1) {
      this.trackedEmitters.splice(index, 1);
    }
  }

  public static update(width: number): void {
    if (!this.text) return;

    const totalParticles = this.trackedEmitters.reduce(
      (sum, emitter) => sum + emitter.getParticleCount(),
      0,
    );
    this.text.text = `Particles: ${totalParticles}`;
    this.text.position.set(width - 10, 10);
  }
}
