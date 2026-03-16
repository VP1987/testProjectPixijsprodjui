export type CardValue =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

export type CardSuit = "spade" | "heart" | "diamond" | "club";

export class CardEntity {
  id: string;
  suit: CardSuit;
  value: CardValue;

  isFaceUp = false;
  isMatched = false;

  constructor(id: string, suit: CardSuit, value: CardValue) {
    this.id = id;
    this.suit = suit;
    this.value = value;
  }

  flip() {
    this.isFaceUp = !this.isFaceUp;
  }

  markMatched() {
    this.isMatched = true;
  }
}
