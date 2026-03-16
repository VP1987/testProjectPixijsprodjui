import * as PIXI from "pixi.js";
import { MenuButtonComponent } from "../components/MenuButtonComponent";
import { BitmapTextComponent } from "@/core/ui/BitmapTextComponent";
import { ErrorLogger } from "@/core/utils/ErrorLogger";

export interface IMenuLayoutData {
  bg: PIXI.Sprite | null;
  title: BitmapTextComponent | null;
  sub: BitmapTextComponent | null;
  divLine: PIXI.Sprite | null;
  buttons: MenuButtonComponent[];
}

export class LayoutHandler {
  static readonly unitSize = 25;
  static readonly screenMobileCols = 15;
  static readonly screenDesktopCols = 80;

  static readonly config = {
    portrait: {
      titleW: { min: 10, max: 25 },
      subW: { min: 10, max: 25 },
      divW: { min: 8, max: 20 },
      buttonW: { min: 10, max: 25 },
      gaps: {
        titleSub: { min: 0.5, max: 1 },
        subDiv: { min: 0.5, max: 1 },
        divBtn: { min: 1.5, max: 3 },
        btnBtn: { min: 1, max: 1.5 },
      },
    },
    landscape: {
      titleW: { min: 7, max: 18 },
      subW: { min: 7, max: 18 },
      divW: { min: 7, max: 18 },
      buttonW: { min: 7, max: 18 },
      gaps: {
        titleSub: { min: 0.2, max: 0.4 },
        subDiv: { min: 0.2, max: 0.4 },
        divBtn: { min: 0.6, max: 1.2 },
        btnBtn: { min: 0.5, max: 0.9 },
      },
    },
  };

  public apply(width: number, height: number, data: IMenuLayoutData): void {
    const centerX = Math.round(width / 2);
    const unit = LayoutHandler.unitSize;
    const cols = width / unit;

    const isPortrait = height > width;
    const config = isPortrait
      ? LayoutHandler.config.portrait
      : LayoutHandler.config.landscape;

    
    if (data.bg) {
      if (!data.bg.texture) {
        ErrorLogger.warn("LayoutHandler: Background texture missing.");
      }

      const scale = Math.max(
        width / data.bg.texture.width,
        height / data.bg.texture.height,
      );

      data.bg.scale.set(scale);
      data.bg.position.set(centerX, Math.round(height / 2));
    }

    
    const titleWidth =
      this.getInterpolated(config.titleW.min, config.titleW.max, cols) * unit;

    const subWidth =
      this.getInterpolated(config.subW.min, config.subW.max, cols) * unit;

    const divWidth =
      this.getInterpolated(config.divW.min, config.divW.max, cols) * unit;

    const buttonWidth =
      this.getInterpolated(config.buttonW.min, config.buttonW.max, cols) * unit;

    const titleBounds = data.title?.getLocalBounds();
    const subBounds = data.sub?.getLocalBounds();

    const titleHeight = titleBounds
      ? titleWidth * (titleBounds.height / titleBounds.width)
      : 0;

    const subHeight = subBounds
      ? subWidth * (subBounds.height / subBounds.width)
      : 0;

    
    const titleSubGap =
      this.getInterpolated(
        config.gaps.titleSub.min,
        config.gaps.titleSub.max,
        cols,
      ) * unit;

    const subDivGap =
      this.getInterpolated(
        config.gaps.subDiv.min,
        config.gaps.subDiv.max,
        cols,
      ) * unit;

    const divBtnGap =
      this.getInterpolated(
        config.gaps.divBtn.min,
        config.gaps.divBtn.max,
        cols,
      ) * unit;

    const btnBtnGap =
      this.getInterpolated(
        config.gaps.btnBtn.min,
        config.gaps.btnBtn.max,
        cols,
      ) * unit;

    
    let buttonHeight = 0;

    if (data.buttons.length > 0) {
      const bounds = data.buttons[0].getLocalBounds();
      if (bounds.width > 0) {
        buttonHeight = buttonWidth * (bounds.height / bounds.width);
      }
    }

    
    let divHeight = 0;
    if (data.divLine) {
      const divBounds = data.divLine.getLocalBounds();
      if (divBounds.width > 0) {
        divHeight = divWidth * (divBounds.height / divBounds.width);
      }
    }

    
    const totalHeight =
      titleHeight +
      titleSubGap +
      subHeight +
      subDivGap +
      divHeight +
      divBtnGap +
      data.buttons.length * buttonHeight +
      Math.max(0, data.buttons.length - 1) * btnBtnGap;

    let currentY = Math.round((height - totalHeight) / 2);

    
    if (data.title && titleBounds) {
      const scale = titleWidth / titleBounds.width;

      data.title.scale.set(scale);
      data.title.position.set(
        centerX,
        Math.round(currentY + data.title.height / 2),
      );

      currentY += data.title.height + titleSubGap;
    }

    
    if (data.sub && subBounds) {
      const scale = subWidth / subBounds.width;

      data.sub.scale.set(scale);
      data.sub.position.set(
        centerX,
        Math.round(currentY + data.sub.height / 2),
      );

      currentY += data.sub.height + subDivGap;
    }

    
    if (data.divLine) {
      
      if (data.divLine) {
        data.divLine.scale.set(1); 
        data.divLine.width = divWidth; 
        data.divLine.position.set(centerX, Math.round(currentY + data.divLine.height / 2));
        currentY += data.divLine.height + divBtnGap;
      }
    }

    
    data.buttons.forEach((button) => {
      const bounds = button.getLocalBounds();

      if (bounds.width > 0) {
        const scale = buttonWidth / bounds.width;
        button.scale.set(scale);
      }

      button.position.set(centerX, Math.round(currentY + button.height / 2));

      currentY += button.height + btnBtnGap;
    });
  }

  private getInterpolated(min: number, max: number, cols: number): number {
    const t =
      (cols - LayoutHandler.screenMobileCols) /
      (LayoutHandler.screenDesktopCols - LayoutHandler.screenMobileCols);

    return min + (max - min) * Math.max(0, Math.min(1, t));
  }
}
