import * as PIXI from "pixi.js";
import { AssetLoader } from "@/core/systems/AssetLoader";
import { CardTextures, Ranks, Suits } from "@/core/types";

export class CardTextureFactory {
  static create(): CardTextures {
    const sheet = AssetLoader.getSpriteSheet("cardsJson");

    const back = sheet.textures["card_back"];
    const face = sheet.textures["card_front"];
    if (!back || !face) {
      throw new Error("Missing base card textures");
    }

    const ranks: Ranks = {
      A: sheet.textures["rank_A"],
      "2": sheet.textures["rank_2"],
      "3": sheet.textures["rank_3"],
      "4": sheet.textures["rank_4"],
      "5": sheet.textures["rank_5"],
      "6": sheet.textures["rank_6"],
      "7": sheet.textures["rank_7"],
      "8": sheet.textures["rank_8"],
      "9": sheet.textures["rank_9"],
      "10": sheet.textures["rank_10"],
      J: sheet.textures["rank_J"],
      Q: sheet.textures["rank_Q"],
      K: sheet.textures["rank_K"],
    };

    const suits: Suits = {
      club: sheet.textures["club"],
      diamond: sheet.textures["diamond"],
      heart: sheet.textures["heart"],
      spade: sheet.textures["spade"],
    };

    
    for (const key in ranks) {
      if (!ranks[key as keyof Ranks]) {
        throw new Error(`Missing rank texture: ${key}`);
      }
    }
    for (const key in suits) {
      if (!suits[key as keyof Suits]) {
        throw new Error(`Missing suit texture: ${key}`);
      }
    }

    return {
      back,
      face,
      ranks,
      suits,
    };
  }
}
