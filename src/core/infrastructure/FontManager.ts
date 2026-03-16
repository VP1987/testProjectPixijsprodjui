import * as PIXI from "pixi.js";
import { IFontConfig } from "@/core/types";
import {
  createOutlineStyle,
  createFillStyle,
} from "@/core/fonts/FontStyleFactory";
import { ErrorLogger } from "@/core/utils/ErrorLogger";

export class FontManager {
  private static _instance: FontManager;
  private fontRegistry: Map<string, PIXI.BitmapFont> = new Map();
  private fontConfigs: IFontConfig[];

  private static readonly characterRanges: PIXI.IBitmapFontOptions["chars"] = [
    ["A", "Z"],
    ["a", "z"],
    "0123456789. !?,-%",
  ];

  private constructor(fontConfigs: IFontConfig[]) {
    this.fontConfigs = fontConfigs;
  }

  public static initialize(fontConfigs: IFontConfig[]): void {
    if (FontManager._instance) {
      ErrorLogger.warn("FontManager already initialized.");
      return;
    }
    FontManager._instance = new FontManager(fontConfigs);
  }

  public static get instance(): FontManager {
    if (!FontManager._instance) {
      throw new Error("FontManager not initialized. Call initialize() first.");
    }
    return FontManager._instance;
  }

  public async loadAndRegisterFonts(
    configsToLoad?: IFontConfig[],
  ): Promise<void> {
    const configs = configsToLoad || this.fontConfigs;

    if (configsToLoad) {
      this.fontConfigs.push(...configsToLoad);
    }

    const fontLoadingPromises = configs.map(async (config) => {
      if (!config.fontFile) return;

      if (PIXI.BitmapFont.available[config.id]) {
        ErrorLogger.warn(`Font ${config.id} is already registered.`);
        return;
      }

      const size = config.size ?? 32;
      const fillColor = config.fillColor ?? 0xffffff;
      const outlineColor = config.outlineColor ?? 0x000000;

      const fontFace = new FontFace(
        `${config.id}Raw`,
        `url(${new URL(config.fontFile, import.meta.url).href})`,
      );

      await fontFace.load();
      document.fonts.add(fontFace);

      const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 3);
      const textureSize = 2048;
      const paddingSize = Math.round(size * 0.25);

      const options = {
        chars: FontManager.characterRanges,
        resolution: devicePixelRatio,
        padding: paddingSize,
        textureWidth: textureSize,
        textureHeight: textureSize,
      };

      PIXI.BitmapFont.from(
        `${config.id}Outline`,
        createOutlineStyle(config.id, size, outlineColor),
        options,
      );

      PIXI.BitmapFont.from(
        config.id,
        createFillStyle(config.id, size, fillColor),
        options,
      );

      this.fontRegistry.set(config.id, PIXI.BitmapFont.available[config.id]);
    });

    await Promise.all(fontLoadingPromises);
  }

  public getFontConfig(fontId: string): {
    fontName: string;
    fontNameOutline: string;
    fontSize: number;
  } {
    const config = this.fontConfigs.find((fc) => fc.id === fontId);

    if (!config) {
      ErrorLogger.warn(`Font configuration for ID '${fontId}' not found.`);

      return {
        fontName: "Arial",
        fontNameOutline: "Arial",
        fontSize: 32,
      };
    }

    return {
      fontName: config.id,
      fontNameOutline: `${config.id}Outline`,
      fontSize: config.size ?? 32,
    };
  }

  private colorToCss(color?: number): string | undefined {
    if (color === undefined) return undefined;
    return `#${color.toString(16).padStart(6, "0")}`;
  }

  public getTextStyle(fontId: string): PIXI.TextStyle {
    const config = this.fontConfigs.find((fc) => fc.id === fontId);

    if (!config) {
      return new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: 32,
        fill: "#ffffff",
      });
    }

    return new PIXI.TextStyle({
      fontFamily: config.fontFamily || `${config.id}Raw`,
      fontSize: config.size ?? 32,
      fill: config.fillColor ?? 0xffffff,
      fontWeight: config.fontWeight,
      stroke: config.stroke ?? config.outlineColor,
      strokeThickness: config.strokeThickness ?? 0,
    });
  }
}
