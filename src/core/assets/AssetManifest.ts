import type { AssetsManifest } from "pixi.js";

export const AssetManifest: AssetsManifest = {
  bundles: [
    {
      name: "coreAssets",
      assets: [
        {
          alias: "uiSpriteSheet",
          src: "/gameAssets/UiSpriteSheet.json",
        },
      ],
    },

    {
      name: "loadingAssets",
      assets: [
        {
          alias: "backgroundLobby",
          src: "/gameAssets/background/bck_lobby.webp",
        },
      ],
    },

    {
      name: "menuAssets",
      assets: [
        {
          alias: "backgroundMenu",
          src: "/gameAssets/background/bck_menu.webp",
        },
      ],
    },
    {
      name: "aceOfShadowsAssets",
      assets: [
        {
          alias: "backgroundAces",
          src: "/gameAssets/background/bck_aces.webp",
        },
        {
          alias: "cardsJson",
          src: "/cardAssets/Cards.json",
        },
      ],
    },
    {
      name: "flamesOfPhoenixAssets",
      assets: [
        {
          alias: "backgroundPhoenix",
          src: "/gameAssets/background/bck_1.webp",
        },
        {
          alias: "spark-effect",
          src: "/gameAssets/effects/SparkEffectSpriteSheet.json",
        },
        {
          alias: "fire-effect",
          src: "/gameAssets/effects/FireEffectSpriteSheet.json",
        },
      ],
    },
    {
      name: "magicWordsAssets",
      assets: [
        {
          alias: "backgroundChat",
          src: "/gameAssets/background/bck_chat.webp",
        },
      ],
    },
    {
      name: "minigameAssets",
      assets: [
        {
          alias: "backgroundMiniGame",
          src: "/gameAssets/background/bck_miniGame.webp",
        },
        {
          alias: "cardsJson",
          src: "/cardAssets/Cards.json",
        },
        {
          alias: "winVideo",
          src: "/gameAssets/cut-scenes/cut-scene.mp4",
        },
        {
          alias: "tutorialDialogJson",
          src: "/src/features/MiniGame/data/dialogTutorial/textDialog.json",
        },
      ],
    },
  ],
};
