import { GameRunner } from "@/core/systems/GameRunner";
import { createPinia } from "pinia";

const pinia = createPinia();

const game = new GameRunner(pinia);

if (import.meta.env.DEV) {
  window.__game = game;
}
