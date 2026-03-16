import * as PIXI from "pixi.js";
import { AssetLoader } from "@/core/systems/AssetLoader";
import { FontManager } from "@/core/infrastructure/FontManager";

export class DialogBoxComponent extends PIXI.Container {
  private static readonly horizontalMargin = 35;
  private static readonly nameOffsetY = -5;

  private bgContainer: PIXI.Container;
  private leftSprite: PIXI.Sprite;
  private centerSprite: PIXI.Sprite;
  private rightSprite: PIXI.Sprite;
  private nameText: PIXI.Text;
  private messageText: PIXI.Text;

  private currentWidth: number = 350;
  private isFlip: boolean = false;
  private baseFontSize: number = 22;

  constructor() {
    super();

    const sheet = AssetLoader.getSpriteSheet("uiSpriteSheet");

    this.bgContainer = new PIXI.Container();
    this.addChild(this.bgContainer);

    this.leftSprite = new PIXI.Sprite(sheet.textures["Dialog_box_1"]);
    this.centerSprite = new PIXI.Sprite(sheet.textures["Dialog_box_2"]);
    this.rightSprite = new PIXI.Sprite(sheet.textures["Dialog_box_3"]);

    this.bgContainer.addChild(this.leftSprite, this.centerSprite, this.rightSprite);

    this.nameText = new PIXI.Text("", FontManager.instance.getTextStyle("tutorialName"));
    this.messageText = new PIXI.Text("", FontManager.instance.getTextStyle("tutorialText"));

    this.addChild(this.nameText, this.messageText);

    this.setSize(350);
    this.eventMode = "static";
    this.cursor = "pointer";
  }

  public setData(name: string, text: string): void {
    this.nameText.text = name;
    this.messageText.text = text;
    this.updateLayout();
  }

  public setSize(width: number): void {
    this.currentWidth = width;
    this.updateLayout();
  }

  public setFlip(flip: boolean): void {
    this.isFlip = flip;
    this.bgContainer.scale.x = flip ? -1 : 1;
    this.updateLayout();
  }

  private updateLayout(): void {
    const lw = this.leftSprite.texture.width;
    const rw = this.rightSprite.texture.width;
    const cw = Math.max(1, this.currentWidth - lw - rw);

    this.leftSprite.x = 0;
    this.centerSprite.x = lw;
    this.rightSprite.x = lw + cw;
    this.centerSprite.width = cw;

    const totalW = lw + cw + rw;
    const totalH = this.leftSprite.texture.height;

    this.bgContainer.pivot.set(totalW / 2, totalH / 2);

    const safeW = totalW - 70;
    this.messageText.style.wordWrap = true;
    this.messageText.style.wordWrapWidth = safeW;
    this.messageText.style.fontSize = this.baseFontSize;

    if (this.isFlip) {
      this.nameText.anchor.set(1, 0);
      this.nameText.position.set(totalW / 2 - DialogBoxComponent.horizontalMargin, -totalH / 2 + DialogBoxComponent.nameOffsetY);
      
      this.messageText.anchor.set(1, 0.5);
      this.messageText.position.set(totalW / 2 - DialogBoxComponent.horizontalMargin, 8);
      this.messageText.style.align = "right";
    } else {
      this.nameText.anchor.set(0, 0);
      this.nameText.position.set(-totalW / 2 + DialogBoxComponent.horizontalMargin, -totalH / 2 + DialogBoxComponent.nameOffsetY);
      
      this.messageText.anchor.set(0, 0.5);
      this.messageText.position.set(-totalW / 2 + DialogBoxComponent.horizontalMargin, 8);
      this.messageText.style.align = "left";
    }

    const maxTextH = totalH - 45;
    if (this.messageText.height > maxTextH) {
        const ratio = maxTextH / this.messageText.height;
        this.messageText.style.fontSize = Math.max(14, Math.floor(this.baseFontSize * ratio));
    }
  }
}
