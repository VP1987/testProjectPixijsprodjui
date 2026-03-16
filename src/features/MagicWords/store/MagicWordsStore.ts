import { defineStore } from 'pinia';
import { IMagicWordsData } from '../domain/MagicWordsEntity';

interface MagicWordsState {
  data: IMagicWordsData | null;
  isLoading: boolean;
  currentMessageIndex: number;
}

export const useMagicWordsStore = defineStore('magicWords', {
  state: (): MagicWordsState => ({
    data: null,
    isLoading: false,
    currentMessageIndex: 0,
  }),
  actions: {
    setData(data: IMagicWordsData) {
      this.data = data;
    },
    setLoading(loading: boolean) {
      this.isLoading = loading;
    },
    nextMessage() {
      if (this.data && this.currentMessageIndex < this.data.dialogue.length) {
        this.currentMessageIndex++;
      }
    },
    reset() {
      this.currentMessageIndex = 0;
    }
  }
});
