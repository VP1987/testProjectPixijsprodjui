import * as PIXI from "pixi.js";

export class FPSCounter {
  private readonly container: PIXI.Container;
  private readonly label: PIXI.Text;
  private frameCount = 0;
  private elapsed = 0;

  constructor() {
    this.container = new PIXI.Container();

    this.container.x = 8;
    this.container.y = 8;

    this.label = new PIXI.Text("FPS: --", {
      fontFamily: "monospace",
      fontSize: 14,
      fontWeight: "bold",
      fill: 0x00ff88,
      dropShadow: true,
      dropShadowColor: 0x000000,
      dropShadowBlur: 4,
      dropShadowDistance: 1,
      dropShadowAlpha: 0.8,
      padding: 4,
    });
    this.container.addChild(this.label);
  }

  update(deltaMsArg: number): void {
    this.frameCount++;
    this.elapsed += deltaMsArg;

    if (this.elapsed >= 500) {
      const fps = Math.round((this.frameCount / this.elapsed) * 1000);
      this.frameCount = 0;
      this.elapsed = 0;
      this.label.text = `FPS: ${fps}`;
      this.label.style.fill =
        fps >= 55 ? 0x00ff88 : fps >= 30 ? 0xffcc00 : 0xff4444;
    }
  }

  getContainer(): PIXI.Container {
    return this.container;
  }
}
