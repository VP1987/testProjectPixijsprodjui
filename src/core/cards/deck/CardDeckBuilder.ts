import * as PIXI from "pixi.js";
import { CardFactory } from "@/core/cards/factories/CardFactory";
import { CardStackLayout } from "@/core/cards/layout/CardStackLayout";
import { CardViewModel } from "@/core/cards/components/CardViewModel";
import { CardSuit, CardValue } from "@/core/cards/domain/CardEntity";
import { Ranks, Suits } from "@/core/types";

export class CardDeckBuilder {
  static buildStack(
    stack: CardViewModel[],
    layer: PIXI.Container,
    pos: { x: number; y: number },
    total: number,
    factory: CardFactory,
    backTex: PIXI.Texture,
    faceTex: PIXI.Texture,
    rankTextures: Ranks,
    suitTextures: Suits,
    cardW: number,
    cardH: number,
  ) {
    if (cardW === 0 || cardH === 0) {
      throw new Error(
        `Invalid card dimensions provided to CardDeckBuilder: w=${cardW}, h=${cardH}. Halting build.`,
      );
    }

    const scaleX = cardW / backTex.width;
    const scaleY = cardH / backTex.height;

    const suits: CardSuit[] = ["spade", "heart", "diamond", "club"];

    const values: CardValue[] = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
    ];

    for (let i = 0; i < total; i++) {
      const suit = suits[i % suits.length];
      const value = values[i % values.length];

      const rankKey = value;

      const card = factory.createCard(
        `card-${i}`,
        suit,
        value,
        backTex,
        faceTex,
        rankTextures[rankKey],
        suitTextures[suit],
      );

      card.sprite.scale.set(scaleX, scaleY);

      CardStackLayout.place(card, i, pos);

      layer.addChild(card.sprite);

      stack.push(card);
    }
  }
}
