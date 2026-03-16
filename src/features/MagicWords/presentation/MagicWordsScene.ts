import * as PIXI from "pixi.js";
import type { IScene, NavigateFn } from "@/core/types";
import { ViewportScaler } from "@/core/systems/ViewportScaler";
import { MagicWordsApiService } from "../services/MagicWordsApiService";
import { useMagicWordsStore } from "../store/MagicWordsStore";
import { MessageComponent, IMessageData } from "./components/MessageComponent";
import { MessageFlowService } from "../services/MessageFlowService";
import { GameSceneButton } from "@/core/ui/GameSceneButton";
import { MagicWordsLayoutManager } from "./layout/MagicWordsLayoutManager";
import { AssetLoader } from "@/core/systems/AssetLoader";

export class MagicWordsScene implements IScene {
  private readonly container: PIXI.Container;
  private readonly backgroundLayer: PIXI.Container;
  private readonly uiLayer: PIXI.Container;
  private readonly messageContainer: PIXI.Container;
  private readonly bgOverlay: PIXI.Graphics;

  private store!: ReturnType<typeof useMagicWordsStore>;
  private flowService!: MessageFlowService;
  private layoutManager!: MagicWordsLayoutManager;

  private messages: MessageComponent[] = [];
  private activeTypingMessage: MessageComponent | null = null;
  private menuButton: GameSceneButton;
  private backgroundSprite: PIXI.Sprite | null = null;
  private targetContainerY = 20;

  constructor(
    private app: PIXI.Application,
    private navigate: NavigateFn,
    private viewport?: ViewportScaler,
  ) {
    this.container = new PIXI.Container();
    this.backgroundLayer = new PIXI.Container();
    this.uiLayer = new PIXI.Container();
    this.container.addChild(this.backgroundLayer, this.uiLayer);

    this.bgOverlay = new PIXI.Graphics();
    this.bgOverlay.alpha = 0.5;
    this.uiLayer.addChild(this.bgOverlay);

    this.messageContainer = new PIXI.Container();
    this.uiLayer.addChild(this.messageContainer);

    this.menuButton = new GameSceneButton(80, 110);
    this.menuButton.onMenuClick = () => this.navigate("menu");

    this.layoutManager = new MagicWordsLayoutManager(
      this.bgOverlay,
      this.messageContainer,
      this.menuButton,
      this.messages,
    );
  }

  async onEnter() {
    this.app.stage.addChild(this.menuButton);
    this.menuButton.visible = true;

    this.store = useMagicWordsStore();
    this.store.reset();
    this.activeTypingMessage = null;
    this.targetContainerY = 20;

    this.clearDisplayObjects();

    await PIXI.Assets.loadBundle("magicWordsAssets");

    this.createBackground();
    this.onResize(window.innerWidth, window.innerHeight);

    const data = await MagicWordsApiService.fetchData();
    this.store.setData(data);

    this.flowService = new MessageFlowService(
      this.store,
      () => this.addMessage(),
      (isTyping) => this.showTyping(isTyping),
    );

    this.showTyping(true);
  }

  private createBackground(): void {
    const backgroundTexture = AssetLoader.getTexture("backgroundChat");
    this.backgroundSprite = new PIXI.Sprite(backgroundTexture);
    this.backgroundSprite.anchor.set(0.5);
    this.backgroundLayer.addChild(this.backgroundSprite);
  }

  private clearDisplayObjects(): void {
    this.messageContainer
      .removeChildren()
      .forEach((child) => child.destroy({ children: true }));

    this.backgroundSprite?.destroy();
    this.backgroundSprite = null;

    this.backgroundLayer.removeChildren();
    this.messages.length = 0;
  }

  private addMessage() {
    if (this.activeTypingMessage) {
      this.activeTypingMessage.setTyping(false);
      this.activeTypingMessage = null;
    } else {
      const idx = this.store.currentMessageIndex;
      const rawMsg = this.store.data!.dialogue[idx];
      const avatar = this.store.data!.avatars.find(
        (a) => a.name === rawMsg.name,
      );

      const msgData: IMessageData = {
        text: rawMsg.text,
        name: rawMsg.name,
        avatarUrl: avatar ? avatar.url : "",
        position: avatar ? avatar.position : "left",
        emojis: this.store.data!.emojies,
      };

      const msgComp = new MessageComponent(msgData);
      msgComp.alpha = 0;
      msgComp.scale.set(0.8);

      this.messages.push(msgComp);
      this.messageContainer.addChild(msgComp);
    }

    this.layoutMessages();
  }

  private showTyping(isTyping: boolean) {
    if (!isTyping) {
      return;
    }

    const idx = this.store.currentMessageIndex;
    const rawMsg = this.store.data!.dialogue[idx];
    const avatar = this.store.data!.avatars.find((a) => a.name === rawMsg.name);

    const msgData: IMessageData = {
      text: rawMsg.text,
      name: rawMsg.name,
      avatarUrl: avatar ? avatar.url : "",
      position: avatar ? avatar.position : "left",
      emojis: this.store.data!.emojies,
    };

    const msgComp = new MessageComponent(msgData);
    msgComp.setTyping(true);
    msgComp.alpha = 0;
    msgComp.scale.set(0.8);

    this.messages.push(msgComp);
    this.messageContainer.addChild(msgComp);
    this.activeTypingMessage = msgComp;

    this.layoutMessages();
  }

  private layoutMessages() {
    const width = this.app.screen.width;
    const height = this.app.screen.height;

    this.targetContainerY = this.layoutManager.layoutMessages(
      this.targetContainerY,
      width,
      height,
    );
  }

  onResize(width: number, height: number) {
    if (this.backgroundSprite) {
      const scale = Math.max(
        width / this.backgroundSprite.texture.width,
        height / this.backgroundSprite.texture.height,
      );

      this.backgroundSprite.scale.set(scale);
      this.backgroundSprite.position.set(
        Math.round(width / 2),
        Math.round(height / 2),
      );
    }

    this.targetContainerY = this.layoutManager.apply(
      { width, height },
      this.targetContainerY,
    );

    this.menuButton.resize(width, height);
    this.app.renderer.render(this.app.stage);
  }

  update(dt: number) {
    const deltaSec = dt;

    if (this.flowService) {
      this.flowService.update(deltaSec);
    }

    const diff = this.targetContainerY - this.messageContainer.y;

    if (Math.abs(diff) > 0.5) {
      this.messageContainer.y += diff * 10 * deltaSec;
    } else {
      this.messageContainer.y = this.targetContainerY;
    }

    this.messages.forEach((msg) => {
      msg.update(deltaSec);

      if (msg.alpha < 1) {
        msg.alpha = Math.min(1, msg.alpha + 5 * deltaSec);
      }

      if (msg.scale.x < 1) {
        const newScale = Math.min(1, msg.scale.x + 2 * deltaSec);
        msg.scale.set(newScale);
      }
    });
  }

  onExit() {
    this.menuButton.visible = false;

    if (this.menuButton.parent) {
      this.menuButton.parent.removeChild(this.menuButton);
    }

    this.bgOverlay.clear();
    this.activeTypingMessage = null;
    this.targetContainerY = 20;

    this.clearDisplayObjects();
  }

  getContainer() {
    return this.container;
  }
}
