import { CardEntity, CardSuit, CardValue } from "@/core/cards/domain/CardEntity";

export interface TableauNode {
  id: number;
  card: CardEntity;
  x: number;
  y: number;
  coveredBy: number[];
  requiredValue: CardValue;
}

export interface InitialTableauNode {
  id: number;
  x: number;
  y: number;
  faceUp: boolean;
  coveredBy: number[];
  requiredValue: CardValue;
}

export const INITIAL_TABLEAU_NODES: InitialTableauNode[] = [
  { id: 0, x: -0.8, y: 0, faceUp: false, coveredBy: [3], requiredValue: "8" },
  { id: 1, x: 0, y: 0, faceUp: false, coveredBy: [3, 4], requiredValue: "9" },
  { id: 2, x: 0.8, y: 0, faceUp: false, coveredBy: [4], requiredValue: "10" },
  { id: 3, x: -0.4, y: 0.45, faceUp: false, coveredBy: [6], requiredValue: "7" },
  { id: 4, x: 0.4, y: 0.45, faceUp: false, coveredBy: [6], requiredValue: "J" },
  { id: 5, x: -1.8, y: 0.9, faceUp: false, coveredBy: [8], requiredValue: "3" },
  { id: 6, x: 0, y: 0.9, faceUp: false, coveredBy: [9, 10], requiredValue: "Q" },
  { id: 7, x: 1.8, y: 0.9, faceUp: false, coveredBy: [11], requiredValue: "9" },
  { id: 8, x: -2.2, y: 1.35, faceUp: false, coveredBy: [12, 13], requiredValue: "2" },
  { id: 9, x: -1.2, y: 1.35, faceUp: false, coveredBy: [13, 14], requiredValue: "A" },
  { id: 10, x: 1.2, y: 1.35, faceUp: false, coveredBy: [15, 16], requiredValue: "K" },
  { id: 11, x: 2.2, y: 1.35, faceUp: false, coveredBy: [16, 17], requiredValue: "10" },
  { id: 12, x: -2.8, y: 1.8, faceUp: true, coveredBy: [], requiredValue: "K" },
  { id: 13, x: -1.8, y: 1.8, faceUp: true, coveredBy: [], requiredValue: "Q" },
  { id: 14, x: -0.8, y: 1.8, faceUp: true, coveredBy: [], requiredValue: "J" },
  { id: 15, x: 0.8, y: 1.8, faceUp: true, coveredBy: [], requiredValue: "4" },
  { id: 16, x: 1.8, y: 1.8, faceUp: true, coveredBy: [], requiredValue: "5" },
  { id: 17, x: 2.8, y: 1.8, faceUp: true, coveredBy: [], requiredValue: "6" },
];

export const TUTORIAL_DRAW_PILE = [
  "2",
  "A",
  "K",
  "Q",
  "J",
  "10"
];

export class SolitaireLogic {
  static generateDeck(): CardEntity[] {
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
    let idCounter = 0;

    for (const suit of suits) {
      for (const value of values) {
        deck.push(new CardEntity(`card-${idCounter++}`, suit, value));
      }
    }

    return deck;
  }

  static shuffleDeck(deck: CardEntity[]): void {
    let currentIndex = deck.length;
    let randomIndex = 0;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      const temp = deck[currentIndex];
      deck[currentIndex] = deck[randomIndex];
      deck[randomIndex] = temp;
    }
  }

  static isMatch(valueA: CardValue, valueB: CardValue): boolean {
    const order: CardValue[] = [
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

    const idxA = order.indexOf(valueA);
    const idxB = order.indexOf(valueB);

    const diff = Math.abs(idxA - idxB);

    if (diff === 1 || diff === 12) {
      return true;
    }

    return false;
  }
}
