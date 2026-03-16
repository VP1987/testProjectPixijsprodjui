import * as PIXI from "pixi.js";
import { GameSceneButton } from "@/core/ui/GameSceneButton";
import { MessageComponent } from "../components/MessageComponent";

export class MagicWordsLayoutManager {
  private bgOverlay: PIXI.Graphics;
  private messageContainer: PIXI.Container;
  private menuButton: GameSceneButton;
  private messages: MessageComponent[];

  constructor(
    bgOverlay: PIXI.Graphics,
    messageContainer: PIXI.Container,
    menuButton: GameSceneButton,
    messages: MessageComponent[],
  ) {
    this.bgOverlay = bgOverlay;
    this.messageContainer = messageContainer;
    this.menuButton = menuButton;
    this.messages = messages;
  }

  public layoutMessages(
    targetContainerY: number,
    width: number,
    height: number,
  ): number {
    const gap = 20;
    let currentY = 0;

    const messageMaxWidth = Math.min(width * 0.8, 600);
    const horizontalMargin = 20;
    const bottomMargin = 120;

    this.messages.forEach((msg) => {
      msg.resize(messageMaxWidth);

      if (msg.data.position === "left") {
        msg.pivot.set(0, 0);
        msg.x = horizontalMargin;
      } else {
        msg.pivot.set(msg.totalWidth, 0);
        msg.x = width - horizontalMargin;
      }

      msg.y = currentY;
      currentY += msg.totalHeight + gap;
    });

    if (currentY > height - bottomMargin) {
      return height - bottomMargin - currentY;
    }

    return 20;
  }

  public updateOverlay(width: number, height: number): void {
    this.bgOverlay.clear();
    this.bgOverlay.beginFill(0x000000);
    this.bgOverlay.drawRect(0, 0, width, height);
    this.bgOverlay.endFill();
  }

  public apply(
    viewportSize: { width: number; height: number },
    targetContainerY: number,
  ): number {
    this.updateOverlay(viewportSize.width, viewportSize.height);

    return this.layoutMessages(
      targetContainerY,
      viewportSize.width,
      viewportSize.height,
    );
  }

  public onResize(
    width: number,
    height: number,
    targetContainerY: number,
  ): number {
    this.menuButton.resize(width, height);

    return this.apply({ width, height }, targetContainerY);
  }
}
