import { defineStore } from "pinia";

interface MiniGameState {
  isBuilt: boolean;
  score: number;
  combo: number;
}

export const useMiniGameStore = defineStore("miniGame", {
  state: (): MiniGameState => ({
    isBuilt: false,
    score: 0,
    combo: 0,
  }),
  actions: {
    markAsBuilt() {
      this.isBuilt = true;
    },
    addScore(points: number) {
      this.score += points;
    },
    incrementCombo() {
      this.combo++;
    },
    resetCombo() {
      this.combo = 0;
    },
    resetGame() {
      this.isBuilt = false;
      this.score = 0;
      this.combo = 0;
    },
  },
  getters: {},
});
