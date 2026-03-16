import * as PIXI from "pixi.js";

export class AssetLoader {
  static getTexture(id: string): PIXI.Texture {
    const tex = PIXI.Assets.get(id) as PIXI.Texture | undefined;

    if (!tex) {
      throw new Error(`[Assets] Texture '${id}' not loaded`);
    }

    return tex;
  }

  static getSpriteSheet(id: string): PIXI.Spritesheet {
    const sheet = PIXI.Assets.get(id) as PIXI.Spritesheet | undefined;

    if (!sheet) {
      throw new Error(`[Assets] Spritesheet '${id}' not loaded`);
    }

    return sheet;
  }
}
