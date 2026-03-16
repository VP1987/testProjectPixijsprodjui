import { useMagicWordsStore } from '../store/MagicWordsStore';

export class MessageFlowService {
  private timer = 0;
  private state: 'typing' | 'waiting' = 'typing';

  constructor(
    private store: ReturnType<typeof useMagicWordsStore>, 
    private onNewMessage: () => void, 
    private onTyping: (isTyping: boolean) => void
  ) {}

  update(dt: number) {
    if (!this.store.data) return;
    if (this.store.currentMessageIndex >= this.store.data.dialogue.length) return;

    this.timer += dt;

    if (this.state === 'typing') {
       if (this.timer > 1.5) { 
           this.state = 'waiting';
           this.timer = 0;
           this.onTyping(false);
           this.onNewMessage();
       }
    } else if (this.state === 'waiting') {
       if (this.timer > 1.5) { 
           this.store.nextMessage();
           if (this.store.currentMessageIndex < this.store.data.dialogue.length) {
               this.state = 'typing';
               this.timer = 0;
               this.onTyping(true);
           }
       }
    }
  }
}
