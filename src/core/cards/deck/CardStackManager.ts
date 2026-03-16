import { CardViewModel } from "@/core/cards/components/CardViewModel";
import { CardStackLayout } from "@/core/cards/layout/CardStackLayout";

export class CardStackManager {
  private stacks: Map<string, CardViewModel[]> = new Map();

  constructor(stackIds: string[]) {
    stackIds.forEach((id) => {
      this.stacks.set(id, []);
    });
  }

  initStack(id: string, cards: CardViewModel[]) {
    if (!this.stacks.has(id)) {
      throw new Error(`[CardStackManager] Stack with id '${id}' does not exist.`);
    }
    this.stacks.set(id, cards);
  }

  refreshStack(id: string, pos: { x: number; y: number }) {
    const stack = this.stacks.get(id);
    if (!stack) {
      throw new Error(`[CardStackManager] Stack with id '${id}' does not exist.`);
    }
    stack.forEach((card, i) => CardStackLayout.place(card, i, pos));
  }

  popCard(id: string): CardViewModel | undefined {
    if (!this.stacks.has(id)) {
      throw new Error(`[CardStackManager] Stack with id '${id}' does not exist.`);
    }
    return this.stacks.get(id)?.pop();
  }

  pushCard(id: string, card: CardViewModel) {
    if (!this.stacks.has(id)) {
      throw new Error(`[CardStackManager] Stack with id '${id}' does not exist.`);
    }
    this.stacks.get(id)?.push(card);
  }

  getStack(id: string): CardViewModel[] {
    return this.stacks.get(id) || [];
  }

  getTopCard(id: string): CardViewModel | undefined {
    const stack = this.stacks.get(id);
    return stack && stack.length > 0 ? stack[stack.length - 1] : undefined;
  }
}
