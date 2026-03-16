import * as PIXI from "pixi.js";

export interface IScene {
  onEnter(): Promise<void> | void;
  onExit(): Promise<void> | void;
  onResize(width: number, height: number): void;
  update(delta: number): void;
  getContainer(): PIXI.Container;
}

export type SceneId =
  | "menu"
  | "loading"
  | "aceOfShadows"
  | "magicWords"
  | "flamesOfPhoenix"
  | "minigame"
  | "golden-quest"
  | "shadow-realm";

export type NavigateFn = (id: SceneId) => void;

export interface IFontConfig extends Partial<PIXI.TextStyle> {
  id: string;
  fontFile?: string;

  fontFamily?: string;
  fillColor?: number;
  outlineColor?: number;

  size?: number;
  fontWeight?: PIXI.TextStyleFontWeight;

  stroke?: number;
  strokeThickness?: number;
}

export type Ranks = {
  A: PIXI.Texture;
  "2": PIXI.Texture;
  "3": PIXI.Texture;
  "4": PIXI.Texture;
  "5": PIXI.Texture;
  "6": PIXI.Texture;
  "7": PIXI.Texture;
  "8": PIXI.Texture;
  "9": PIXI.Texture;
  "10": PIXI.Texture;
  J: PIXI.Texture;
  Q: PIXI.Texture;
  K: PIXI.Texture;
};

export type Suits = {
  club: PIXI.Texture;
  diamond: PIXI.Texture;
  heart: PIXI.Texture;
  spade: PIXI.Texture;
};

export interface CardTextures {
  back: PIXI.Texture;
  face: PIXI.Texture;
  ranks: Ranks;
  suits: Suits;
}
