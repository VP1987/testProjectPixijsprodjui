import { CardViewModel } from "@/core/cards/components/CardViewModel";
import { cardStackYOffsetPx } from "@/features/AceOfShadows/constants";

export class CardStackLayout {
  static place(
    card: CardViewModel,
    i: number,
    pos: { x: number; y: number },
  ): void {
    card.sprite.x = pos.x;
    card.sprite.y = pos.y - i * cardStackYOffsetPx;
  }
}
