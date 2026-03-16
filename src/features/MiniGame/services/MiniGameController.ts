import * as PIXI from "pixi.js";
import { CardViewModel } from "@/core/cards/components/CardViewModel";
import { SolitaireLogic, TableauNode, INITIAL_TABLEAU_NODES, TUTORIAL_DRAW_PILE } from "@/features/MiniGame/domain/SolitaireLogic";
import { AnimationEngine } from "@/core/cards/animation/AnimationEngine";
import { CardFlyAnimation } from "@/core/cards/animation/CardFlyAnimation";
import { CardFlipAnimation } from "@/core/cards/animation/CardFlipAnimation";
import { useMiniGameStore } from "@/features/MiniGame/store/MiniGameStore";
import { CardStackManager } from "@/core/cards/deck/CardStackManager";

export interface MiniGameConfig {
  flyDuration: number;
  flipDuration: number;
}

export class MiniGameController {
  private animationEngine: AnimationEngine;
  private cardLayer: PIXI.Container;
  private miniGameStore: ReturnType<typeof useMiniGameStore>;
  private stackManager: CardStackManager;
  private config: MiniGameConfig;

  private getActiveCardPosition: () => { x: number; y: number };

  constructor(
    animationEngine: AnimationEngine,
    cardLayer: PIXI.Container,
    miniGameStore: ReturnType<typeof useMiniGameStore>,
    stackManager: CardStackManager,
    getActiveCardPosition: () => { x: number; y: number },
    config: MiniGameConfig
  ) {
    this.animationEngine = animationEngine;
    this.cardLayer = cardLayer;
    this.miniGameStore = miniGameStore;
    this.stackManager = stackManager;
    this.getActiveCardPosition = getActiveCardPosition;
    this.config = config;
  }

  public initializeGame(cards: CardViewModel[]): void {
    this.miniGameStore.resetGame();

    const mutableCards = [...cards];

    INITIAL_TABLEAU_NODES.forEach((def, index) => {
      const foundIdx = mutableCards.findIndex(c => c.entity.value === def.requiredValue);
      const vm = mutableCards.splice(foundIdx, 1)[0];
      
      vm.entity.isFaceUp = def.faceUp;
      vm.sync();

      const stackId = `tableau-${index}`;
      this.stackManager.initStack(stackId, [vm]);
    });

    const firstActiveIdx = mutableCards.findIndex(c => c.entity.value === "3");
    const firstActive = mutableCards.splice(firstActiveIdx, 1)[0];
    firstActive.entity.isFaceUp = true;
    firstActive.sync();
    this.stackManager.initStack("activePile", [firstActive]);

    const drawPileCards: CardViewModel[] = [];
    for (const forcedValue of TUTORIAL_DRAW_PILE) {
      const foundIdx = mutableCards.findIndex(c => c.entity.value === forcedValue);
      if (foundIdx !== -1) {
        const vm = mutableCards.splice(foundIdx, 1)[0];
        vm.entity.isFaceUp = false;
        vm.sync();
        drawPileCards.push(vm);
      }
    }

    while (mutableCards.length > 0) {
      const vm = mutableCards.shift()!;
      vm.entity.isFaceUp = false;
      vm.sync();
      drawPileCards.push(vm);
    }
    
    this.stackManager.initStack("drawPile", drawPileCards);
    this.miniGameStore.markAsBuilt();
  }

  public handleTableauClick(index: number): void {
    if (!this.miniGameStore.isBuilt) return;

    const stackId = `tableau-${index}`;
    const card = this.stackManager.getStack(stackId)[0];
    if (!card) return;

    const def = INITIAL_TABLEAU_NODES[index];
    const isCovered = def.coveredBy.some((covId: number) => this.stackManager.getStack(`tableau-${covId}`).length > 0);
    if (isCovered) return;

    const activePile = this.stackManager.getStack("activePile");
    const activeCard = activePile[activePile.length - 1];
    if (!activeCard) return;

    if (SolitaireLogic.isMatch(card.entity.value, activeCard.entity.value)) {
      this.miniGameStore.addScore(100 * (this.miniGameStore.combo + 1));
      this.miniGameStore.incrementCombo();

      this.stackManager.popCard(stackId);
      const startX = card.sprite.x;
      const startY = card.sprite.y;

      this.stackManager.pushCard("activePile", card);
      this.cardLayer.addChild(card.sprite);

      this.animationEngine.add(
        new CardFlyAnimation(
          card,
          () => ({ x: startX, y: startY }),
          this.getActiveCardPosition,
          this.config.flyDuration,
          this.animationEngine,
          false
        ),
      );

      this.checkAndRevealCards();
    } else {
      this.miniGameStore.resetCombo();
    }
  }

  private checkAndRevealCards(): void {
    INITIAL_TABLEAU_NODES.forEach((def, index) => {
      const stackId = `tableau-${index}`;
      const card = this.stackManager.getStack(stackId)[0];
      
      if (card && !card.entity.isFaceUp) {
        const isStillCovered = def.coveredBy.some((covId: number) => this.stackManager.getStack(`tableau-${covId}`).length > 0);
        if (!isStillCovered) {
          this.animationEngine.add(new CardFlipAnimation(card, this.config.flipDuration));
        }
      }
    });
  }

  public handleDrawClick(): void {
    if (!this.miniGameStore.isBuilt) return;

    const drawnCard = this.stackManager.popCard("drawPile");
    if (!drawnCard) return;

    this.miniGameStore.resetCombo();

    const startX = drawnCard.sprite.x;
    const startY = drawnCard.sprite.y;

    this.stackManager.pushCard("activePile", drawnCard);
    this.cardLayer.addChild(drawnCard.sprite);

    this.animationEngine.add(
      new CardFlyAnimation(
        drawnCard,
        () => ({ x: startX, y: startY }),
        this.getActiveCardPosition,
        this.config.flyDuration,
        this.animationEngine,
        true
      ),
    );
  }

  public getTableau(): { node: TableauNode; viewModel: CardViewModel }[] {
    const result: { node: TableauNode; viewModel: CardViewModel }[] = [];
    INITIAL_TABLEAU_NODES.forEach((def, index) => {
      const card = this.stackManager.getStack(`tableau-${index}`)[0];
      if (card) {
        result.push({ 
          node: { ...def, card: card.entity }, 
          viewModel: card 
        });
      }
    });
    return result;
  }

  public getDrawPile(): CardViewModel[] {
    return this.stackManager.getStack("drawPile");
  }

  public getActivePile(): CardViewModel[] {
    return this.stackManager.getStack("activePile");
  }
}
