import * as PIXI from "pixi.js";
import { AssetLoader } from "@/core/systems/AssetLoader";
import { FontManager } from "@/core/infrastructure/FontManager";

const lerpFactor = 0.2;
const hoverScale = 1.05;

export class MenuButtonComponent extends PIXI.Container {
  private innerContainer: PIXI.Container;
  private bgContainer: PIXI.Container;

  private leftSprite: PIXI.Sprite;
  private centerSprite: PIXI.Sprite;
  private rightSprite: PIXI.Sprite;

  private textBlock: PIXI.Container;
  private labelText: PIXI.Text;

  private buttonSprite: PIXI.Sprite | null = null;

  private targetScale = 1;

  private readonly defaultPaddingX = 20;
  private paddingX = 0;
  private readonly textOffsetY = -3;

  private baseWidth = 0;
  private baseTextWidth = 0;

  public onSceneSelected: (() => void) | null = null;

  constructor(fontId: string, label: string, extraPaddingX: number = 0) {
    super();

    this.paddingX = this.defaultPaddingX + extraPaddingX;

    const sheet = AssetLoader.getSpriteSheet("uiSpriteSheet");

    const leftTexture = sheet.textures["Btn_left"];
    const centerTexture = sheet.textures["Btn_centar"];
    const rightTexture = sheet.textures["Btn_right"];

    this.innerContainer = new PIXI.Container();
    this.addChild(this.innerContainer);

    this.bgContainer = new PIXI.Container();
    this.innerContainer.addChild(this.bgContainer);

    this.leftSprite = new PIXI.Sprite(leftTexture);
    this.centerSprite = new PIXI.Sprite(centerTexture);
    this.rightSprite = new PIXI.Sprite(rightTexture);

    this.leftSprite.roundPixels = true;
    this.centerSprite.roundPixels = true;
    this.rightSprite.roundPixels = true;

    this.bgContainer.addChild(
      this.leftSprite,
      this.centerSprite,
      this.rightSprite,
    );

    this.textBlock = new PIXI.Container();
    this.innerContainer.addChild(this.textBlock);

    
    this.labelText = new PIXI.Text(
      label,
      FontManager.instance.getTextStyle("menuButton"),
    );
    this.labelText.anchor.set(0.5);
    this.textBlock.addChild(this.labelText);

    this.initializeLayout();

    this.eventMode = "static";
    this.cursor = "pointer";

    this.on("pointerover", this.onHover);
    this.on("pointerout", this.onOut);
    this.on("pointertap", this.onTap);

    PIXI.Ticker.shared.add(this.updateTransition, this);
  }

  private initializeLayout(): void {
    const textBounds = this.labelText.getLocalBounds();
    this.baseTextWidth = textBounds.width;

    const leftWidth = Math.round(this.leftSprite.texture.width);
    const rightWidth = Math.round(this.rightSprite.texture.width);

    const centerWidth = Math.round(this.baseTextWidth + this.paddingX * 2);
    const initialWidth = leftWidth + centerWidth + rightWidth;
    this.baseWidth = initialWidth;

    this.applyButtonWidth(initialWidth);
  }

  public getBaseWidth(): number {
    return this.baseWidth;
  }

  public setButtonWidth(width: number): void {
    this.applyButtonWidth(width);
  }

  private applyButtonWidth(width: number): void {
    const leftWidth = Math.round(this.leftSprite.texture.width);
    const rightWidth = Math.round(this.rightSprite.texture.width);
    const centerWidth = Math.max(1, Math.round(width - leftWidth - rightWidth));
    const textureHeight = Math.round(this.leftSprite.texture.height);

    this.leftSprite.x = 0;
    this.centerSprite.x = leftWidth;
    this.rightSprite.x = leftWidth + centerWidth;

    this.centerSprite.width = centerWidth;

    this.leftSprite.height = textureHeight;
    this.centerSprite.height = textureHeight;
    this.rightSprite.height = textureHeight;

    const totalWidth = leftWidth + centerWidth + rightWidth;

    this.bgContainer.pivot.set(
      Math.round(totalWidth / 2),
      Math.round(textureHeight / 2),
    );
    this.bgContainer.position.set(0, 0);

    const availableTextSpace = width - this.paddingX * 2;
    const textScale = Math.min(1, availableTextSpace / this.baseTextWidth);
    this.labelText.scale.set(textScale);

    this.textBlock.pivot.set(0, 0);
    this.textBlock.position.set(0, Math.round(this.textOffsetY));

    this.labelText.x = 0;
    this.labelText.y = 0;
  }

  public bakeToTexture(app: PIXI.Application): void {
    if (this.buttonSprite) return;

    const texture = app.renderer.generateTexture(this.bgContainer);

    this.buttonSprite = new PIXI.Sprite(texture);
    this.buttonSprite.anchor.set(0.5);

    this.innerContainer.removeChild(this.bgContainer);
    this.innerContainer.addChildAt(this.buttonSprite, 0);

    this.bgContainer.destroy({ children: true });
  }

  private onHover = (): void => {
    this.targetScale = hoverScale;
  };

  private onOut = (): void => {
    this.targetScale = 1;
  };

  private onTap = (): void => {
    this.onSceneSelected?.();
  };

  private updateTransition(): void {
    const current = this.innerContainer.scale.x;
    if (Math.abs(current - this.targetScale) < 0.001) return;
    const next = current + (this.targetScale - current) * lerpFactor;
    this.innerContainer.scale.set(next);
  }

  override destroy(options?: boolean | PIXI.IDestroyOptions): void {
    PIXI.Ticker.shared.remove(this.updateTransition, this);
    this.off("pointerover", this.onHover);
    this.off("pointerout", this.onOut);
    this.off("pointertap", this.onTap);
    this.onSceneSelected = null;
    super.destroy(options);
  }
}
