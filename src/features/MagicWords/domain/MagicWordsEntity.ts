export interface IDialogueLine {
  name: string;
  text: string;
}

export interface IEmoji {
  name: string;
  url: string;
}

export interface IAvatar {
  name: string;
  url: string;
  position: "left" | "right";
}

export interface IMagicWordsData {
  dialogue: IDialogueLine[];
  emojies: IEmoji[];
  avatars: IAvatar[];
}
