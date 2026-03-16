import * as PIXI from "pixi.js";
import { DialogBoxComponent } from "../components/DialogBoxComponent";

export interface ITutorialLayoutData {
  girl: PIXI.Sprite;
  granny: PIXI.Sprite;
  dialogBox: DialogBoxComponent;
  arrow: PIXI.Sprite;
  bubble: PIXI.Sprite;
}

export class MiniGameTutorialLayoutHandler {
  public apply(
    width: number,
    height: number,
    data: ITutorialLayoutData,
    currentStep: number,
  ): void {
    const isPortrait = height > width;
    const margin = 20;

    const baseCharScale = (height * 0.4) / 512;
    const charScale = isPortrait
      ? baseCharScale * 0.5 * 1.3
      : baseCharScale * 1.3;

    data.girl.scale.set(charScale);
    data.granny.scale.set(charScale);

    data.girl.position.set(margin, height);
    data.granny.position.set(width - margin, height);

    const dialogW = width * (isPortrait ? 0.8 : 0.4);
    data.dialogBox.setSize(dialogW);

    if (isPortrait) {
      data.dialogBox.position.set(width / 2, height / 2);
    } else {
      let dialogX = width * 0.35;
      if (currentStep === 3) {
        dialogX = width * 0.65;
      }
      data.dialogBox.position.set(dialogX, height * 0.5);
    }

    data.bubble.scale.set(isPortrait ? 0.25 : 0.5);
    data.arrow.scale.set(isPortrait ? 0.1 : 0.2);
  }
}
