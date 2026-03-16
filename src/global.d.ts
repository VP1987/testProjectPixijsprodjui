import { GameRunner } from "@/core/systems/GameRunner";

declare global {
  interface Window {
    __game: GameRunner;
  }
}
