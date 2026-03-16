import * as PIXI from "pixi.js";
import { FontManager } from "@/core/infrastructure/FontManager";

export class BitmapTextComponent extends PIXI.Container {
  private _text: string = "";
  private _outline: PIXI.BitmapText;
  private _fill: PIXI.BitmapText;
  public centered: boolean = true;

  constructor(fontId: string, text: string, centered: boolean = true, scale: number = 1) {
    super();
    this.centered = centered;
    this.scale.set(scale);

    const fontConfig = FontManager.instance.getFontConfig(fontId);

    this._outline = new PIXI.BitmapText("", {
      fontName: fontConfig.fontNameOutline,
      fontSize: fontConfig.fontSize,
      align: "left",
    });

    this._fill = new PIXI.BitmapText("", {
      fontName: fontConfig.fontName,
      fontSize: fontConfig.fontSize,
      align: "left",
    });

    this.addChild(this._outline, this._fill);
    this.text = text;
  }

  set text(value: string) {
    if (this._text === value) return;
    this._text = value;
    this._outline.text = value;
    this._fill.text = value;
    this.updateLayout();
  }

  get text(): string {
    return this._text;
  }

  private updateLayout(): void {
    const bounds = this._fill.getLocalBounds();
    const cx = this.centered ? Math.round(-bounds.width / 2) : 0;
    const cy = Math.round(-bounds.height / 2);
    this._outline.position.set(cx, cy);
    this._fill.position.set(cx, cy);
  }
}
