import * as PIXI from "pixi.js";

function drawDashedLine(
  graphics: PIXI.Graphics,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  dashLen: number,
  gapLen: number,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const count = Math.floor(len / (dashLen + gapLen));

  for (let i = 0; i < count; i++) {
    const t1 = (i * (dashLen + gapLen)) / len;
    const t2 = (i * (dashLen + gapLen) + dashLen) / len;
    graphics.moveTo(x1 + dx * t1, y1 + dy * t1);
    graphics.lineTo(x1 + dx * t2, y1 + dy * t2);
  }
}

export class StackPlaceholderBuilder {
  public static readonly baseW = 100;
  public static readonly baseH = 140;

  static build(
    container: PIXI.Container,
    cardW: number,
    cardH: number,
    w: number,
    h: number,
  ) {
    const hPad = w * 0.22;
    const stackAPos = { x: hPad, y: h / 2 };
    const stackBPos = { x: w - hPad, y: h / 2 };

    const placeholderA = this.draw();
    const placeholderB = this.draw();

    placeholderA.position.set(stackAPos.x, stackAPos.y);
    placeholderB.position.set(stackBPos.x, stackBPos.y);

    placeholderA.scale.set(cardW / this.baseW, cardH / this.baseH);
    placeholderB.scale.set(cardW / this.baseW, cardH / this.baseH);

    container.addChild(placeholderA);
    container.addChild(placeholderB);

    return {
      stackAPos,
      stackBPos,
      placeholderA,
      placeholderB,
    };
  }

  private static draw(): PIXI.Graphics {
    const g = new PIXI.Graphics();
    const dash = 10;
    const gap = 6;

    g.lineStyle(2, 0xffffff, 0.4);

    const left = -this.baseW / 2;
    const right = this.baseW / 2;
    const top = -this.baseH / 2;
    const bottom = this.baseH / 2;

    drawDashedLine(g, left, top, right, top, dash, gap);
    drawDashedLine(g, right, top, right, bottom, dash, gap);
    drawDashedLine(g, right, bottom, left, bottom, dash, gap);
    drawDashedLine(g, left, bottom, left, top, dash, gap);

    return g;
  }
}
