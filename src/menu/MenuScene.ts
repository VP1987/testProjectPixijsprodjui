import * as PIXI from "pixi.js";
import type { IScene, SceneId } from "@/core/types/index";
import { TextureFactory } from "@/core/infrastructure/TextureFactory";
import { AssetLoader } from "@/core/systems/AssetLoader";
import { BitmapTextComponent } from "@/core/ui/BitmapTextComponent";
import { MenuButtonComponent } from "./components/MenuButtonComponent";
import { LayoutHandler } from "./layout/LayoutHandler";
import { LocalFonts } from "./fonts/LocalFonts";
import { FontManager } from "@/core/infrastructure/FontManager";
export class MenuScene implements IScene {
  private readonly container: PIXI.Container;
  private readonly backgroundLayer: PIXI.Container;
  private readonly uiLayer: PIXI.Container;
  private readonly layoutHandler: LayoutHandler;

  private app: PIXI.Application;
  private navigate: (id: SceneId) => void;

  private backgroundSprite: PIXI.Sprite | null = null;
  private titleText: BitmapTextComponent | null = null;
  private subText: BitmapTextComponent | null = null;
  private divisionLine: PIXI.Sprite | null = null;

  private buttons: MenuButtonComponent[] = [];

  private readonly items = [
    { id: "aceOfShadows" as SceneId, label: "Ace of Shadows" },
    { id: "magicWords" as SceneId, label: "Magic Words" },
    { id: "flamesOfPhoenix" as SceneId, label: "Flames of Phoenix" },
    { id: "minigame" as SceneId, label: "Mini Game" },
  ];

  constructor(app: PIXI.Application, navigate: (id: SceneId) => void) {
    this.app = app;
    this.navigate = navigate;

    this.container = new PIXI.Container();
    this.backgroundLayer = new PIXI.Container();
    this.uiLayer = new PIXI.Container();

    this.container.addChild(this.backgroundLayer, this.uiLayer);

    this.layoutHandler = new LayoutHandler();
  }

  async onEnter(): Promise<void> {
    await FontManager.instance.loadAndRegisterFonts(LocalFonts);

    this.createObjects();
    this.onResize(window.innerWidth, window.innerHeight);
  }

  private createObjects(): void {
    this.clearDisplayObjects();

    const backgroundTexture = AssetLoader.getTexture("backgroundMenu");

    this.backgroundSprite = new PIXI.Sprite(backgroundTexture);
    this.backgroundSprite.anchor.set(0.5);

    this.backgroundLayer.addChild(this.backgroundSprite);

    this.titleText = new BitmapTextComponent(
      "menuTitleFont",
      "SOFTGAMES",
      true,
    );

    this.subText = new BitmapTextComponent(
      "menuSubtitleFont",
      "GAME DEVELOPER ASSIGNMENT",
      true,
    );

    this.uiLayer.addChild(this.titleText, this.subText);

    const divTexture = TextureFactory.bakeOnce(
      this.app.renderer,
      "menu-div",
      (g) => {
        g.lineStyle(4, 0xffd54a, 1);
        g.moveTo(-400, 0);
        g.lineTo(400, 0);
      },
    );

    this.divisionLine = new PIXI.Sprite(divTexture);
    this.divisionLine.anchor.set(0.5);

    this.uiLayer.addChild(this.divisionLine);

    this.buttons = this.items.map((item) => {
      const button = new MenuButtonComponent("menuButton", item.label);

      button.onSceneSelected = () => {
        this.navigate(item.id);
      };

      this.uiLayer.addChild(button);

      return button;
    });

    
    const maxBtnWidth = Math.max(...this.buttons.map((b) => b.getBaseWidth()));

    this.buttons.forEach((button) => {
      button.setButtonWidth(maxBtnWidth);
      
      button.bakeToTexture(this.app);
    });
  }

  onResize(width: number, height: number): void {
    this.layoutHandler.apply(width, height, {
      bg: this.backgroundSprite,
      title: this.titleText,
      sub: this.subText,
      divLine: this.divisionLine,
      buttons: this.buttons,
    });

    
    this.app.renderer.render(this.app.stage);
  }

  update(): void {}

  onExit(): void {
    this.clearDisplayObjects();
  }

  private clearDisplayObjects(): void {
    this.backgroundSprite?.destroy();
    this.titleText?.destroy();
    this.subText?.destroy();
    this.divisionLine?.destroy();

    this.buttons.forEach((btn) => {
      btn.onSceneSelected = null;
      btn.destroy({ children: true });
    });

    this.buttons = [];

    this.backgroundSprite = null;
    this.titleText = null;
    this.subText = null;
    this.divisionLine = null;

    this.backgroundLayer.removeChildren();
    this.uiLayer.removeChildren();
  }

  getContainer(): PIXI.Container {
    return this.container;
  }
}
