import * as PIXI from "pixi.js";



export class TextureFactory {
  private static cache: Map<string, PIXI.Texture> = new Map();
  private static renderer: PIXI.IRenderer | null = null;

  static init(renderer: PIXI.IRenderer): void {
    this.renderer = renderer;
  }

  static bakeOnce(
    renderer: PIXI.IRenderer,
    keyArg: string,
    draw: (g: PIXI.Graphics) => void,
  ): PIXI.Texture {
    if (!this.renderer) this.renderer = renderer;
    return this.bake(keyArg, draw);
  }

  private static bake(
    keyArg: string,
    draw: (graphics: PIXI.Graphics) => void,
  ): PIXI.Texture {
    if (this.cache.has(keyArg)) return this.cache.get(keyArg)!;
    if (!this.renderer) throw new Error("TextureFactory not initialised");

    const g = new PIXI.Graphics();
    draw(g);
    const tex = this.renderer.generateTexture(g);
    g.destroy();
    this.cache.set(keyArg, tex);
    return tex;
  }

  static cardBack(w: number, h: number): PIXI.Texture {
    return this.bake(`card-back-${w}-${h}`, (graphics) => {
      graphics.beginFill(0x000000, 0.25);
      graphics.drawRoundedRect(3, 4, w, h, 8);
      graphics.endFill();

      graphics.lineStyle(2, 0x8b5cf6, 1);
      graphics.beginFill(0x1e1b4b);
      graphics.drawRoundedRect(0, 0, w, h, 8);
      graphics.endFill();

      graphics.lineStyle(1, 0x7c3aed, 0.6);
      graphics.drawRoundedRect(5, 5, w - 10, h - 10, 5);

      graphics.lineStyle(1, 0x4c1d95, 0.5);
      const step = 12;
      let y: number;
      let x: number;
      for (y = 10; y < h - 10; y += step) {
        for (x = 10; x < w - 10; x += step) {
          graphics.drawPolygon([
            x + step / 2,
            y,
            x + step,
            y + step / 2,
            x + step / 2,
            y + step,
            x,
            y + step / 2,
          ]);
        }
      }

      graphics.lineStyle(0);
      graphics.beginFill(0x7c3aed, 0.4);
      graphics.drawCircle(w / 2, h / 2, 10);
      graphics.endFill();
      graphics.beginFill(0xa78bfa, 0.7);
      graphics.drawCircle(w / 2, h / 2, 5);
      graphics.endFill();
    });
  }

  static cardFace(
    w: number,
    h: number,
    suitArg: string,
    valueArg: string,
    isRedArg: boolean,
  ): PIXI.Texture {
    const key = `card-face-${w}-${h}-${suitArg}-${valueArg}`;
    return this.bake(key, (graphics) => {
      graphics.beginFill(0x000000, 0.2);
      graphics.drawRoundedRect(3, 4, w, h, 8);
      graphics.endFill();

      graphics.lineStyle(1.5, isRedArg ? 0xfca5a5 : 0x94a3b8, 0.8);
      graphics.beginFill(0xfef9f0);
      graphics.drawRoundedRect(0, 0, w, h, 8);
      graphics.endFill();

      graphics.lineStyle(0);
      graphics.beginFill(isRedArg ? 0xdc2626 : 0x1e293b);
      graphics.drawRoundedRect(4, 4, 22, 28, 3);
      graphics.endFill();

      graphics.beginFill(isRedArg ? 0xdc2626 : 0x1e293b);
      graphics.drawRoundedRect(w - 26, h - 32, 22, 28, 3);
      graphics.endFill();

      const suitColor = isRedArg ? 0xb91c1c : 0x0f172a;
      graphics.beginFill(suitColor, 0.12);
      graphics.drawCircle(w / 2, h / 2, w * 0.28);
      graphics.endFill();
    });
  }

  static button(
    w: number,
    h: number,
    colorArg: number,
    alphaArg = 0.9,
  ): PIXI.Texture {
    const key = `btn-${w}-${h}-${colorArg}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const graphics = new PIXI.Graphics();
    graphics.beginFill(0x000000, 0.3);
    graphics.drawRoundedRect(2, 3, w, h, 8);
    graphics.endFill();

    graphics.lineStyle(1.5, colorArg, 0.7);
    graphics.beginFill(0x0d0d1a, alphaArg);
    graphics.drawRoundedRect(0, 0, w, h, 8);
    graphics.endFill();

    graphics.lineStyle(0);
    graphics.beginFill(0xffffff, 0.04);
    graphics.drawRoundedRect(2, 2, w - 4, h / 2 - 2, 6);
    graphics.endFill();

    if (!this.renderer) throw new Error("TextureFactory not initialised");

    const texture = this.renderer.generateTexture(graphics);
    this.cache.set(key, texture);
    graphics.destroy();
    return texture;
  }

  static buttonHover(w: number, h: number, colorArg: number): PIXI.Texture {
    return this.bake(`btn-hover-${w}-${h}-${colorArg}`, (graphics) => {
      graphics.beginFill(0x000000, 0.3);
      graphics.drawRoundedRect(2, 3, w, h, 8);
      graphics.endFill();

      graphics.lineStyle(2, colorArg, 1);
      graphics.beginFill(0x1a1a2e, 1);
      graphics.drawRoundedRect(0, 0, w, h, 8);
      graphics.endFill();

      graphics.lineStyle(0);
      graphics.beginFill(colorArg, 0.08);
      graphics.drawRoundedRect(0, 0, w, h, 8);
      graphics.endFill();
    });
  }

  static feltBackground(w: number, h: number): PIXI.Texture {
    return this.bake(`felt-${w}-${h}`, (graphics) => {
      graphics.beginFill(0x064e3b);
      graphics.drawRect(0, 0, w, h);
      graphics.endFill();

      const cx = w / 2;
      const cy = h / 2;
      const steps = 12;
      let r: number;
      let a: number;
      let i: number;
      for (i = steps; i > 0; i--) {
        r = Math.max(w, h) * (i / steps);
        a = (1 - i / steps) * 0.45;
        graphics.beginFill(0x000000, a);
        graphics.drawCircle(cx, cy, r);
        graphics.endFill();
      }

      graphics.lineStyle(1, 0x065f46, 0.3);
      let y: number;
      for (y = 0; y < h; y += 6) {
        graphics.moveTo(0, y);
        graphics.lineTo(w, y);
      }
    });
  }

  static menuBackground(w: number, h: number): PIXI.Texture {
    return this.bake(`menu-smooth-vignette-${w}-${h}`, (graphics) => {
      graphics.beginFill(0x222222);
      graphics.drawRect(0, 0, w, h);
      graphics.endFill();

      const cx = w / 2;
      const cy = h / 2;
      const grid = 60;
      graphics.lineStyle(2, 0x050505, 1);

      let x: number;
      let y: number;
      for (x = 0; x <= w; x += grid) {
        graphics.moveTo(x, 0);
        graphics.lineTo(x, h);
      }
      for (y = 0; y <= h; y += grid) {
        graphics.moveTo(0, y);
        graphics.lineTo(w, y);
      }

      const steps = 150;
      const maxR = Math.sqrt(w * w + h * h) / 1.8;
      let r: number;
      let a: number;
      let i: number;
      for (i = 0; i <= steps; i++) {
        r = (i / steps) * maxR;
        a = Math.pow(i / steps, 3);
        graphics.lineStyle(maxR / steps + 2, 0x050505, a);
        graphics.drawCircle(cx, cy, r);
      }
    });
  }

  static menuCard(w: number, h: number, accentColorArg: number): PIXI.Texture {
    return this.bake(`menu-card-${w}-${h}-${accentColorArg}`, (graphics) => {
      graphics.beginFill(0x000000, 0.3);
      graphics.drawRoundedRect(3, 4, w, h, 10);
      graphics.endFill();

      graphics.lineStyle(1, accentColorArg, 0.4);
      graphics.beginFill(0x0d0d20, 0.92);
      graphics.drawRoundedRect(0, 0, w, h, 10);
      graphics.endFill();

      graphics.lineStyle(0);
      graphics.beginFill(accentColorArg, 0.9);
      graphics.drawRoundedRect(0, 0, 4, h, 2);
      graphics.endFill();
    });
  }

  static menuCardHover(
    w: number,
    h: number,
    accentColorArg: number,
  ): PIXI.Texture {
    return this.bake(
      `menu-card-hover-${w}-${h}-${accentColorArg}`,
      (graphics) => {
        graphics.beginFill(0x000000, 0.3);
        graphics.drawRoundedRect(3, 4, w, h, 10);
        graphics.endFill();

        graphics.lineStyle(1.5, accentColorArg, 0.9);
        graphics.beginFill(0x16162e, 1);
        graphics.drawRoundedRect(0, 0, w, h, 10);
        graphics.endFill();

        graphics.lineStyle(0);
        graphics.beginFill(accentColorArg, 0.06);
        graphics.drawRoundedRect(0, 0, w, h, 10);
        graphics.endFill();

        graphics.beginFill(accentColorArg, 1);
        graphics.drawRoundedRect(0, 0, 4, h, 2);
        graphics.endFill();
      },
    );
  }

  static divLine(width: number, height: number, color: number): PIXI.Texture {
    return this.bake(`div-line-${width}-${height}-${color}`, (g) => {
      g.lineStyle(height, color, 1);
      g.moveTo(0, height / 2);
      g.lineTo(width, height / 2);
    });
  }

  static flameShape(w: number, h: number, colorArg: number): PIXI.Texture {
    return this.bake(`flame-${w}-${h}-${colorArg}`, (graphics) => {
      graphics.beginFill(colorArg);
      graphics.moveTo(w / 2, 0);
      graphics.bezierCurveTo(w * 0.9, h * 0.25, w, h * 0.6, w / 2, h);
      graphics.bezierCurveTo(0, h * 0.6, w * 0.1, h * 0.25, w / 2, 0);
      graphics.endFill();

      graphics.beginFill(0xffffff, 0.25);
      graphics.moveTo(w / 2, h * 0.1);
      graphics.bezierCurveTo(
        w * 0.7,
        h * 0.3,
        w * 0.65,
        h * 0.55,
        w / 2,
        h * 0.7,
      );
      graphics.bezierCurveTo(0, h * 0.6, w * 0.35, h * 0.55, w * 0.3, h * 0.3);
      graphics.endFill();
    });
  }

  static emberDot(radiusArg: number): PIXI.Texture {
    return this.bake(`ember-${radiusArg}`, (graphics) => {
      graphics.beginFill(0xff6600, 0.3);
      graphics.drawCircle(radiusArg, radiusArg, radiusArg);
      graphics.endFill();
      graphics.beginFill(0xffdd44, 0.9);
      graphics.drawCircle(radiusArg, radiusArg, radiusArg * 0.55);
      graphics.endFill();
      graphics.beginFill(0xffffff, 0.8);
      graphics.drawCircle(radiusArg, radiusArg, radiusArg * 0.25);
      graphics.endFill();
    });
  }

  static stackShadow(w: number, h: number): PIXI.Texture {
    return this.bake(`stack-shadow-${w}-${h}`, (graphics) => {
      graphics.beginFill(0x000000, 0.35);
      graphics.drawEllipse(w / 2, h / 2, w / 2, h / 4);
      graphics.endFill();
    });
  }

  static avatarCircle(radiusArg: number, colorArg: number): PIXI.Texture {
    return this.bake(`avatar-${radiusArg}-${colorArg}`, (graphics) => {
      graphics.beginFill(colorArg);
      graphics.drawCircle(radiusArg, radiusArg, radiusArg);
      graphics.endFill();
      graphics.lineStyle(1.5, 0xffffff, 0.2);
      graphics.drawCircle(radiusArg, radiusArg, radiusArg - 1);
    });
  }

  static dialogBubble(w: number, h: number, colorArg: number): PIXI.Texture {
    return this.bake(`dialog-${w}-${h}-${colorArg}`, (graphics) => {
      graphics.lineStyle(1, colorArg, 0.6);
      graphics.beginFill(0x12122a, 0.96);
      graphics.drawRoundedRect(0, 0, w, h, 10);
      graphics.endFill();
    });
  }

  static heartShape(sizeArg: number, colorArg: number): PIXI.Texture {
    return this.bake(`heart-${sizeArg}-${colorArg}`, (graphics) => {
      const s = sizeArg / 20;
      graphics.beginFill(colorArg);
      graphics.drawCircle(5 * s, 6 * s, 5 * s);
      graphics.drawCircle(15 * s, 6 * s, 5 * s);
      graphics.drawPolygon([0, 8 * s, 10 * s, 20 * s, 20 * s, 8 * s]);
      graphics.endFill();    });
  }

  static starShape(radiusArg: number, colorArg: number): PIXI.Texture {
    return this.bake(`star-${radiusArg}-${colorArg}`, (graphics) => {
      const points = 5;
      const outerR = radiusArg;
      const innerR = radiusArg * 0.4;
      const pts: number[] = [];
      let angle: number;
      let i: number;
      let r: number;
      for (i = 0; i < points * 2; i++) {
        r = i % 2 === 0 ? outerR : innerR;
        angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
        pts.push(
          radiusArg + Math.cos(angle) * r,
          radiusArg + Math.sin(angle) * r,
        );
      }
      graphics.beginFill(colorArg);
      graphics.drawPolygon(pts);
      graphics.endFill();    });
  }

  static glowParticle(radiusArg: number, starPoints: number = 4): PIXI.Texture {
    return this.bake(`glow-particle-${radiusArg}-${starPoints}`, (graphics) => {
      const cx = radiusArg;
      const cy = radiusArg;

      const glowLayers = 6;
      let r: number;
      let a: number;
      let i: number;
      for (i = glowLayers; i > 0; i--) {
        r = radiusArg * (i / glowLayers);
        a = (1 - i / glowLayers) * 0.35;
        graphics.beginFill(0xff8c00, a);
        graphics.drawCircle(cx, cy, r);
        graphics.endFill();
      }

      graphics.beginFill(0xffa500, 0.6);
      graphics.drawCircle(cx, cy, radiusArg * 0.55);
      graphics.endFill();
      const outerR = radiusArg * 0.42;
      const innerR = radiusArg * 0.18;
      const pts: number[] = [];
      let angle: number;
      for (i = 0; i < starPoints * 2; i++) {
        r = i % 2 === 0 ? outerR : innerR;
        angle = (i / (starPoints * 2)) * Math.PI * 2 - Math.PI / 2;
        pts.push(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      }
      graphics.beginFill(0xffe066, 1);
      graphics.drawPolygon(pts);
      graphics.endFill();

      graphics.beginFill(0xffffff, 0.95);
      graphics.drawCircle(cx, cy, radiusArg * 0.14);
      graphics.endFill();    });
  }

  static clearCache(): void {
    this.cache.forEach((texArg) => texArg.destroy());
    this.cache.clear();
  }
}
