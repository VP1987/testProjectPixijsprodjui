import { AnimationEngine } from "@/core/cards/animation/AnimationEngine";
import { CardMovementService } from "@/features/AceOfShadows/services/CardMovementService";
import { useAceOfShadowsStore } from "@/features/AceOfShadows/store/AceOfShadowsStore";
import { cardTransferIntervalSeconds } from "@/features/AceOfShadows/constants";
import { CardStackManager } from "@/core/cards/deck/CardStackManager";

export class GameLoopService {
  private animationEngine: AnimationEngine;

  private cardMovementService: CardMovementService;
  private aceOfShadowsStore: ReturnType<typeof useAceOfShadowsStore>;
  private stackManager: CardStackManager;

  constructor(
    animationEngine: AnimationEngine,
    cardMovementService: CardMovementService,
    aceOfShadowsStore: ReturnType<typeof useAceOfShadowsStore>,
    stackManager: CardStackManager,
  ) {
    this.animationEngine = animationEngine;
    this.cardMovementService = cardMovementService;
    this.aceOfShadowsStore = aceOfShadowsStore;
    this.stackManager = stackManager;
  }

  public update(dt: number): void {
    if (!this.aceOfShadowsStore.isBuilt) return;

    this.animationEngine.update(dt);

    if (this.stackManager.getStack("stackA").length === 0) {
      return;
    }

    this.aceOfShadowsStore.incrementTransferTimer(dt);

    if (
      this.aceOfShadowsStore.transferTimer >= cardTransferIntervalSeconds
    ) {
      this.aceOfShadowsStore.resetTransferTimer();
      this.cardMovementService.moveCard();
    }
  }
}

