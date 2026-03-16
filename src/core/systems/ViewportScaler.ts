import * as PIXI from "pixi.js";

export class ViewportScaler {
  static readonly designW = 1920;
  static readonly designH = 1080;

  private app: PIXI.Application;

  constructor(app: PIXI.Application) {
    this.app = app;

    const canvas = app.view as HTMLCanvasElement;
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.display = "block";
  }

  public getScaleData(w: number, h: number) {
    const screenW = w;
    const screenH = h;
    const localDesignW = ViewportScaler.designW;
    const localDesignH = ViewportScaler.designH;

    const scale = Math.min(screenW / localDesignW, screenH / localDesignH);
    const offsetX = (screenW - localDesignW * scale) * 0.5;
    const offsetY = (screenH - localDesignH * scale) * 0.5;

    return {
      scale,
      offsetX,
      offsetY,
      designW: localDesignW,
      designH: localDesignH,
    };
  }

  getLogicalSize(): { width: number; height: number } {
    return {
      width: ViewportScaler.designW,
      height: ViewportScaler.designH,
    };
  }
}
