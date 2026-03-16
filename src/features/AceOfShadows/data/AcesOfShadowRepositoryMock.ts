import { CardEntity, CardSuit, CardValue } from "@/core/cards/domain/CardEntity";
import { IAcesOfShadowsRepository } from "@/features/AceOfShadows/data/IAcesOfShadowRepository";

export class AcesOfShadowsRepositoryMock implements IAcesOfShadowsRepository {
  private cards: CardEntity[] = [];

  createDeck(): CardEntity[] {
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

    const deck: CardEntity[] = [];

    let id = 0;

    for (const suit of suits) {
      for (const value of values) {
        deck.push(new CardEntity(String(id++), suit, value));
      }
    }

    this.cards = deck;

    return deck;
  }

  shuffle(cardsArg: CardEntity[]): CardEntity[] {
    const arr = [...cardsArg];

    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
  }

  getCards(): CardEntity[] {
    return this.cards;
  }
}
