import * as PIXI from "pixi.js";
import {
  CardEntity,
  type CardSuit,
  type CardValue,
} from "@/core/cards/domain/CardEntity";
import { CardViewModel } from "@/core/cards/components/CardViewModel";

export class CardFactory {
  createCard(
    id: string,
    suit: CardSuit,
    value: CardValue,
    backTexture: PIXI.Texture,
    faceTexture: PIXI.Texture,
    rankTexture: PIXI.Texture,
    suitTexture: PIXI.Texture,
  ): CardViewModel {
    const entity = new CardEntity(id, suit, value);

    return new CardViewModel(
      entity,
      backTexture,
      faceTexture,
      rankTexture,
      suitTexture,
      1,
    );
  }
}
