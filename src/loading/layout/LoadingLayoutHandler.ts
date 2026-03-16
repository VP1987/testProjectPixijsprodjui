import * as PIXI from "pixi.js";
import { BitmapTextComponent } from "@/core/ui/BitmapTextComponent";
import { ProgressBarComponent } from "../components/ProgressBarComponent";

export interface ILoadingLayoutData {
  bg: PIXI.Sprite | null;
  title: BitmapTextComponent | null;
  sub: BitmapTextComponent | null;
  divLine: PIXI.Sprite | null;
  progressBar: ProgressBarComponent | null;
}

export class LoadingLayoutHandler {
  static readonly unitSize = 25;
  static readonly screenMobileCols = 15;
  static readonly screenDesktopCols = 80;

  static readonly config = {
    portrait: {
      margin: { min: 6, max: 10 },
      titleW: { min: 10, max: 25 },
      subW: { min: 10, max: 25 },
      divW: { min: 10, max: 25 },

      progressBarW: { min: 10, max: 25 },
      gaps: {
        titleSub: { min: 0.5, max: 1 },
        subDiv: { min: 0.5, max: 1 },
        divProgressBar: { min: 1.5, max: 3 },
      },
    },
    landscape: {
      margin: { min: 0.25, max: 3 },
      titleW: { min: 7, max: 18 },
      subW: { min: 7, max: 18 },
      divW: { min: 7, max: 18 },

      progressBarW: { min: 7, max: 18 },
      gaps: {
        titleSub: { min: 0.1, max: 0.3 },
        subDiv: { min: 0.1, max: 0.3 },
        divProgressBar: { min: 1, max: 2 },
      },
    },
  };

  public apply(w: number, h: number, data: ILoadingLayoutData): void {
    const centerX = Math.round(w / 2);
    const unit = LoadingLayoutHandler.unitSize;
    const cols = w / unit;
    const isPortrait = h > w;
    const c = isPortrait
      ? LoadingLayoutHandler.config.portrait
      : LoadingLayoutHandler.config.landscape;

    if (data.bg) {
      const scale = Math.max(
        w / data.bg.texture.width,
        h / data.bg.texture.height,
      );
      data.bg.scale.set(scale);
      data.bg.position.set(centerX, Math.round(h / 2));
    }

    let totalBlockHeight = 0;

    if (data.title) {
      const tw = this.getInterpolated(c.titleW.min, c.titleW.max, cols) * unit;
      data.title.scale.set(1);
      data.title.scale.set(tw / data.title.width);
      totalBlockHeight += data.title.height;
    }

    if (data.sub) {
      const sw = this.getInterpolated(c.subW.min, c.subW.max, cols) * unit;
      const gap =
        this.getInterpolated(c.gaps.titleSub.min, c.gaps.titleSub.max, cols) *
        unit;
      data.sub.scale.set(1);
      data.sub.scale.set(sw / data.sub.width);
      totalBlockHeight += data.sub.height + gap;
    }

    if (data.divLine) {
      const dw = this.getInterpolated(c.divW.min, c.divW.max, cols) * unit;
      const gap =
        this.getInterpolated(c.gaps.subDiv.min, c.gaps.subDiv.max, cols) * unit;
      data.divLine.width = dw;
      totalBlockHeight += data.divLine.height + gap;
    }

    if (data.progressBar) {
      const targetPbW =
        this.getInterpolated(c.progressBarW.min, c.progressBarW.max, cols) *
        unit;
      const gap =
        this.getInterpolated(
          c.gaps.divProgressBar.min,
          c.gaps.divProgressBar.max,
          cols,
        ) * unit;

      data.progressBar.scale.set(1);
      data.progressBar.scale.set(targetPbW / data.progressBar.width);

      totalBlockHeight += data.progressBar.height + gap;
    }

    let currentY = Math.round((h - totalBlockHeight) / 2);

    if (data.title) {
      data.title.position.set(
        centerX,
        Math.round(currentY + data.title.height / 2),
      );
      currentY +=
        data.title.height +
        this.getInterpolated(c.gaps.titleSub.min, c.gaps.titleSub.max, cols) *
          unit;
    }

    if (data.sub) {
      data.sub.position.set(
        centerX,
        Math.round(currentY + data.sub.height / 2),
      );
      currentY +=
        data.sub.height +
        this.getInterpolated(c.gaps.subDiv.min, c.gaps.subDiv.max, cols) * unit;
    }

    if (data.divLine) {
      data.divLine.position.set(centerX, Math.round(currentY));
      currentY +=
        data.divLine.height / 2 +
        this.getInterpolated(
          c.gaps.divProgressBar.min,
          c.gaps.divProgressBar.max,
          cols,
        ) *
          unit;
    }

    if (data.progressBar) {
      data.progressBar.position.set(
        centerX,
        Math.round(currentY + data.progressBar.height / 2),
      );
    }
  }

  private getInterpolated(min: number, max: number, cols: number): number {
    const t =
      (cols - LoadingLayoutHandler.screenMobileCols) /
      (LoadingLayoutHandler.screenDesktopCols -
        LoadingLayoutHandler.screenMobileCols);
    return min + (max - min) * Math.max(0, Math.min(1, t));
  }
}
