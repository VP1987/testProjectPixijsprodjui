import * as PIXI from "pixi.js";
import { BitmapTextComponent } from "@/core/ui/BitmapTextComponent";

export interface IUiLayoutData {
  title: BitmapTextComponent | null;
  sub: BitmapTextComponent | null;
}

export class MiniGameUiLayoutHandler {
  static readonly unitSize = 25;
  static readonly screenMobileCols = 15;
  static readonly screenDesktopCols = 80;

  static readonly config = {
    portrait: {
      titleW: { min: 10, max: 25 },
      subW: { min: 10, max: 25 },
      gaps: {
        titleSub: { min: 0.5, max: 1 },
      },
    },
    landscape: {
      titleW: { min: 7, max: 18 },
      subW: { min: 7, max: 18 },
      gaps: {
        titleSub: { min: 0.2, max: 0.4 },
      },
    },
  };

  public apply(width: number, height: number, data: IUiLayoutData): void {
    const unit = MiniGameUiLayoutHandler.unitSize;
    const cols = width / unit;
    const isPortrait = height > width;
    const c = isPortrait
      ? MiniGameUiLayoutHandler.config.portrait
      : MiniGameUiLayoutHandler.config.landscape;

    let totalHeight = 0;

    if (data.title) {
      const tw = this.getInterpolated(c.titleW.min, c.titleW.max, cols) * unit;
      data.title.scale.set(1);
      data.title.scale.set(tw / data.title.width);
      totalHeight += data.title.height;
    }

    if (data.sub) {
      const sw = this.getInterpolated(c.subW.min, c.subW.max, cols) * unit;
      const gap = this.getInterpolated(c.gaps.titleSub.min, c.gaps.titleSub.max, cols) * unit;
      data.sub.scale.set(1);
      data.sub.scale.set(sw / data.sub.width);
      totalHeight += data.sub.height + gap;
    }

    let currentY = -totalHeight / 2;

    if (data.title) {
      data.title.position.set(0, Math.round(currentY + data.title.height / 2));
      currentY += data.title.height + this.getInterpolated(c.gaps.titleSub.min, c.gaps.titleSub.max, cols) * unit;
    }

    if (data.sub) {
      data.sub.position.set(0, Math.round(currentY + data.sub.height / 2));
    }
  }

  private getInterpolated(min: number, max: number, cols: number): number {
    const t = (cols - MiniGameUiLayoutHandler.screenMobileCols) / (MiniGameUiLayoutHandler.screenDesktopCols - MiniGameUiLayoutHandler.screenMobileCols);
    return min + (max - min) * Math.max(0, Math.min(1, t));
  }
}
