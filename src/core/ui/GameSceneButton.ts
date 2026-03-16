import * as PIXI from "pixi.js";
import { TextureFactory } from "@/core/infrastructure/TextureFactory";

export class GameSceneButton extends PIXI.Container {
  private backgroundSprite: PIXI.Sprite;
  private labelText: PIXI.Text;
  private minW: number;
  private maxW: number;

  public onMenuClick: (() => void) | null = null;

  constructor(minW: number, maxW: number) {
    super();

    this.minW = minW;
    this.maxW = maxW;

    this.backgroundSprite = new PIXI.Sprite();
    this.addChild(this.backgroundSprite);

    this.labelText = new PIXI.Text("MENU", {
      fontFamily: "monospace",
      fontSize: 24,
      fill: 0xffffff,
      fontWeight: "bold",
    });

    this.labelText.anchor.set(0.5);
    this.addChild(this.labelText);

    this.eventMode = "static";
    this.cursor = "pointer";

    this.on("pointertap", () => {
      if (this.onMenuClick) {
        this.onMenuClick();
      }
    });

    this.resize(window.innerWidth, window.innerHeight);
  }

  public resize(screenWidth: number, screenHeight: number): void {
    const ratio = 0.4;
    const textPadding = 40;

    let desiredW = screenWidth * 0.15;
    let finalW = Math.max(this.minW, Math.min(desiredW, this.maxW));

    const finalH = finalW * ratio;

    this.labelText.style.fontSize = Math.round(finalH * 0.4);

    const textWidthNeeded = this.labelText.width + textPadding;

    if (textWidthNeeded > finalW) {
      finalW = Math.min(this.maxW, textWidthNeeded);
    }

    const finalHeight = finalW * ratio;

    this.backgroundSprite.texture = TextureFactory.button(
      finalW,
      finalHeight,
      0xd97706,
    );

    this.labelText.x = Math.round(finalW / 2);
    this.labelText.y = Math.round(finalHeight / 2);

    const padding = 20;

    this.x = Math.round(padding);
    this.y = Math.round(screenHeight - finalHeight - padding);
  }
}
