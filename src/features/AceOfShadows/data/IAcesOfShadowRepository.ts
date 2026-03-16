import { CardEntity } from "@/core/cards/domain/CardEntity";

export interface IAcesOfShadowsRepository {
  createDeck(): CardEntity[];

  shuffle(cards: CardEntity[]): CardEntity[];

  getCards(): CardEntity[];
}
