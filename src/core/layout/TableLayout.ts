export class TableLayout {
  static compute(w: number, h: number) {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const isLandscape = screenW > screenH;
    const compact = screenW < 900;

    let cardW: number;
    let hPad: number;

    if (isLandscape) {
      
      cardW = Math.min(w * 0.16, h * 0.26) * 0.8;
      
      hPad = w * 0.35;
    } else if (compact) {
      
      cardW = Math.min(w * 0.42, h * 0.32);
      hPad = w * 0.22;
    } else {
      
      cardW = Math.min(w * 0.16, h * 0.26);
      hPad = w * 0.22;
    }

    const cardH = cardW * 1.4;
    const stackOffset = cardH * 0.06;

    return {
      cardW,
      cardH,
      stackOffset,
      stackAPos: { x: hPad, y: h / 2 },
      stackBPos: { x: w - hPad, y: h / 2 },
    };
  }
}
