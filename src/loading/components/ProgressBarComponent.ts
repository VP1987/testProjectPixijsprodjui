import * as PIXI from "pixi.js";
import { FontManager } from "@/core/infrastructure/FontManager";
export class ProgressBarComponent extends PIXI.Container {
  private backgroundSprite: PIXI.Sprite;
  private fillSprite: PIXI.Sprite;
  private frameSprite: PIXI.NineSlicePlane;
  private labelText: PIXI.Text;
  private barMask: PIXI.Graphics;

  private currentProgress: number = 0;
  private barWidth: number = 0;
  private readonly barHeight: number;
  private readonly sideWidth: number = 128;

  constructor(
    width: number,
    textures: {
      frame: PIXI.Texture;
      background: PIXI.Texture;
      fill: PIXI.Texture;
    },
  ) {
    super();

    this.barHeight = textures.frame.height;

    this.backgroundSprite = new PIXI.Sprite(textures.background);
    this.fillSprite = new PIXI.Sprite(textures.fill);

    this.barMask = new PIXI.Graphics();
    this.frameSprite = new PIXI.NineSlicePlane(
      textures.frame,
      this.sideWidth,
      0,
      this.sideWidth,
      0,
    );

    this.labelText = new PIXI.Text(
      "0%",
      FontManager.instance.getTextStyle("loading"),
    );
    this.labelText.anchor.set(0.5);

    const maskContainer = new PIXI.Container();
    maskContainer.addChild(this.backgroundSprite);
    maskContainer.addChild(this.fillSprite);
    maskContainer.mask = this.barMask;

    this.addChild(this.barMask);
    this.addChild(maskContainer);
    this.addChild(this.frameSprite);
    this.addChild(this.labelText);

    this.setSize(width);
  }

  public setSize(width: number): void {
    this.barWidth = width;

    const hOffset = 12;
    const vOffset = 14;
    const visualTextOffset = -5;
    const innerW = width - hOffset * 2;
    const innerH = this.barHeight - vOffset * 2;

    this.frameSprite.width = width;
    this.frameSprite.height = this.barHeight;

    this.barMask.clear();
    this.barMask.beginFill(0xffffff);
    this.barMask.drawRoundedRect(hOffset, vOffset, innerW, innerH, 15);
    this.barMask.endFill();

    this.backgroundSprite.x = hOffset;
    this.backgroundSprite.y = vOffset;
    this.backgroundSprite.width = innerW;
    this.backgroundSprite.height = innerH;

    this.fillSprite.x = hOffset;
    this.fillSprite.y = vOffset;
    this.fillSprite.height = innerH;

    this.labelText.x = Math.round(width / 2);
    this.labelText.y = Math.round(this.barHeight / 2) + visualTextOffset;

    this.updateFill();
    this.pivot.set(width / 2, this.barHeight / 2);
  }

  private updateFill(): void {
    const hOffset = 12;
    const maxInnerW = this.barWidth - hOffset * 2;

    this.fillSprite.width = maxInnerW * (this.currentProgress / 100);
    this.labelText.text = `${Math.round(this.currentProgress)}%`;
  }

  set progress(value: number) {
    this.currentProgress = Math.max(0, Math.min(100, value));
    this.updateFill();
  }
}
