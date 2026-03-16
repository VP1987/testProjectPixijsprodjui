import { defineStore } from "pinia";

interface AceOfShadowsState {
  totalCards: number;
  isBuilt: boolean;
  transferTimer: number;
}

export const useAceOfShadowsStore = defineStore("aceOfShadows", {
  state: (): AceOfShadowsState => ({
    totalCards: 144,
    isBuilt: false,
    transferTimer: 0,
  }),
  actions: {
    markAsBuilt() {
      this.isBuilt = true;
    },
    resetTransferTimer() {
      this.transferTimer = 0;
    },
    incrementTransferTimer(dt: number) {
      this.transferTimer += dt;
    },
  },
  getters: {},
});
