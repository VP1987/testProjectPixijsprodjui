import * as PIXI from "pixi.js";
import { ViewportScaler } from "@/core/systems/ViewportScaler";
import type { IScene, SceneId } from "@/core/types/index";

import { AceOfShadowsScene } from "@/features/AceOfShadows/presentation/AceOfShadowsScene";
import { MagicWordsScene } from "@/features/MagicWords/presentation/MagicWordsScene";
import { MenuScene } from "@/menu/MenuScene";
import { LoadingScene } from "@/loading/LoadingScene";
import { FlamesOfPhoenixScene } from "@/features/FlamesOfPhoenix/presentation/FlamesOfPhoenixScene";

type NavigateFn = (id: SceneId) => void;

export class SceneFactory {
  static create(
    id: SceneId,
    app: PIXI.Application,
    navigate: NavigateFn,
    viewport: ViewportScaler,
  ): IScene {
    app.renderer.options.autoDensity = true;
    app.renderer.options.resolution = window.devicePixelRatio || 1;

    PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.LINEAR;

    switch (id) {
      case "menu":
        return new MenuScene(app, navigate);

      case "loading":
        return new LoadingScene(app, navigate, "menu");

      case "aceOfShadows":
        return new AceOfShadowsScene(app, navigate, viewport);

      case "magicWords":
        return new MagicWordsScene(app, navigate, viewport);
        
      case "flamesOfPhoenix":
        return new FlamesOfPhoenixScene(app, navigate, viewport);

      default:
        throw new Error(`Scene not implemented: ${id}`);
    }
  }
}
