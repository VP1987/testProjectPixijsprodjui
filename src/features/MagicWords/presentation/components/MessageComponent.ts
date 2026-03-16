import * as PIXI from "pixi.js";

export interface IMessageData {
  text: string;
  name: string;
  avatarUrl: string;
  position: "left" | "right";
  emojis: { name: string; url: string }[];
}

export class MessageComponent extends PIXI.Container {
  public bubbleWidth = 0;

  private bgGraphics: PIXI.Graphics;
  private contentContainer: PIXI.Container;
  private nameText: PIXI.Text;
  private avatarContainer: PIXI.Container;

  private currentMaxWidth = 0;
  public targetY = 0;

  private isTypingMode = false;

  private dotsContainer: PIXI.Container;
  private typingDots: PIXI.Graphics[] = [];
  private time = 0;

  private layoutWidth = 0;
  private layoutHeight = 0;

  constructor(public readonly data: IMessageData) {
    super();

    this.bgGraphics = new PIXI.Graphics();
    this.contentContainer = new PIXI.Container();

    this.nameText = new PIXI.Text(data.name, {
      fontFamily: "Arial",
      fontSize: 14,
      fill: 0x888888,
      fontWeight: "bold",
    });

    this.dotsContainer = new PIXI.Container();

    for (let i = 0; i < 3; i++) {
      const dot = new PIXI.Graphics();
      dot.beginFill(0x888888);
      dot.drawCircle(0, 0, 5);
      dot.endFill();
      this.typingDots.push(dot);
      this.dotsContainer.addChild(dot);
    }

    this.dotsContainer.visible = false;

    this.avatarContainer = new PIXI.Container();

    const baseCircle = new PIXI.Graphics();
    baseCircle.beginFill(0x444444);
    baseCircle.drawCircle(20, 20, 20);
    baseCircle.endFill();
    this.avatarContainer.addChild(baseCircle);

    const letter = data.name ? data.name.charAt(0).toUpperCase() : "?";

    const letterText = new PIXI.Text(letter, {
      fontFamily: "Arial",
      fontSize: 20,
      fill: 0xffffff,
      fontWeight: "bold",
    });

    letterText.anchor.set(0.5);
    letterText.position.set(20, 20);
    this.avatarContainer.addChild(letterText);

    if (data.avatarUrl && data.avatarUrl.trim() !== "") {
      PIXI.Texture.fromURL(data.avatarUrl)
        .then((tex) => {
          if (this.destroyed || this.avatarContainer.destroyed) return;

          const avatarSprite = new PIXI.Sprite(tex);
          avatarSprite.width = 40;
          avatarSprite.height = 40;

          const mask = new PIXI.Graphics();
          mask.beginFill(0xffffff);
          mask.drawCircle(20, 20, 20);
          mask.endFill();

          avatarSprite.mask = mask;

          this.avatarContainer.addChild(avatarSprite);
          this.avatarContainer.addChild(mask);

          letterText.visible = false;
        })
        .catch(() => {});
    }

    this.addChild(this.avatarContainer);
    this.addChild(this.nameText);
    this.addChild(this.bgGraphics);
    this.addChild(this.contentContainer);
    this.addChild(this.dotsContainer);
  }

  public setTyping(isTyping: boolean) {
    this.isTypingMode = isTyping;
    this.buildLayout();
  }

  public update(dt: number) {
    if (!this.isTypingMode) return;

    this.time += dt * 8;

    this.typingDots.forEach((dot, i) => {
      const delay = i * 0.8;
      dot.y = 20 + Math.sin(this.time * 0.5 - delay) * 4;
      dot.alpha = 0.3 + (Math.sin(this.time * 0.5 - delay) + 1) * 0.35;
    });
  }

  public resize(maxWidth: number) {
    if (this.currentMaxWidth === maxWidth) return;

    this.currentMaxWidth = maxWidth;
    this.buildLayout();
  }

  private buildLayout() {
    this.contentContainer.removeChildren().forEach((c) => c.destroy());

    const avatarWidth = 40;
    const avatarHeight = 40;
    const avatarMargin = 10;
    const padding = 12;
    const nameGap = 4;
    const bubbleRadius = 10;
    const lineHeight = 24;
    const spaceWidth = 6;

    let contentWidth = 0;
    let contentHeight = 0;

    if (this.isTypingMode) {
      this.nameText.visible = true;
      this.contentContainer.visible = false;
      this.dotsContainer.visible = true;

      contentWidth = 70 - padding * 2;
      contentHeight = 40 - padding * 2;

      this.typingDots.forEach((dot, i) => {
        dot.x = 20 + i * 15;
        dot.y = 20;
      });
    } else {
      this.nameText.visible = true;
      this.contentContainer.visible = true;
      this.dotsContainer.visible = false;

      const words = this.data.text.split(" ");

      let currentX = 0;
      let currentY = 0;

      const maxTextWidth =
        this.currentMaxWidth - avatarWidth - avatarMargin - padding * 2;

      const finalizeLine = () => {
        currentX = 0;
        currentY += lineHeight + 4;
      };

      let actualTextWidth = 0;

      words.forEach((word) => {
        const emojiMatch = word.match(/\{([a-zA-Z0-9_]+)\}/);
        let isEmoji = false;
        let emojiName = "";

        if (emojiMatch) {
          emojiName = emojiMatch[1];
          if (this.data.emojis.find((e) => e.name === emojiName)) {
            isEmoji = true;
          }
        }

        let itemWidth = 0;
        let itemObj: PIXI.DisplayObject;

        if (isEmoji) {
          itemWidth = 24;
          const spr = new PIXI.Sprite(PIXI.Texture.EMPTY);
          const emojiData = this.data.emojis.find((e) => e.name === emojiName);
          if (emojiData) {
            PIXI.Texture.fromURL(emojiData.url)
              .then((tex) => {
                if (spr.destroyed) return;
                spr.texture = tex;
                spr.width = 24;
                spr.height = 24;
              })
              .catch((err) => console.error("Failed to load emoji:", err));
          }
          itemObj = spr;
        } else {
          const t = new PIXI.Text(word, {
            fontFamily: "Arial",
            fontSize: 16,
            fill: 0xffffff,
          });
          itemWidth = t.width;
          itemObj = t;
        }

        if (currentX + itemWidth > maxTextWidth && currentX > 0) {
          finalizeLine();
        }

        itemObj.x = currentX;
        itemObj.y = currentY;

        if (isEmoji) {
          itemObj.y += (lineHeight - 24) / 2;
        } else {
          itemObj.y += (lineHeight - (itemObj as PIXI.Text).height) / 2;
        }

        this.contentContainer.addChild(itemObj);

        currentX += itemWidth + spaceWidth;
        actualTextWidth = Math.max(actualTextWidth, currentX - spaceWidth);
      });

      contentWidth = Math.max(actualTextWidth, this.nameText.width);
      contentHeight = currentY + lineHeight;
    }

    const bubbleHeight = contentHeight + padding * 2;
    this.bubbleWidth = contentWidth + padding * 2;

    
    const bubbleY = this.nameText.height + nameGap;

    this.bgGraphics.clear();
    this.bgGraphics.beginFill(
      this.data.position === "right" ? 0x146c5a : 0x202c33,
    );

    this.bgGraphics.drawRoundedRect(
      0,
      bubbleY,
      this.bubbleWidth,
      bubbleHeight,
      bubbleRadius,
    );

    this.bgGraphics.endFill();

    if (this.data.position === "left") {
      this.avatarContainer.x = 0;
      this.avatarContainer.y = bubbleY;

      this.bgGraphics.x = avatarWidth + avatarMargin;

      this.nameText.x = this.bgGraphics.x;
      this.nameText.y = 0;

      this.contentContainer.x = this.bgGraphics.x + padding;
      this.contentContainer.y = bubbleY + padding;

      this.dotsContainer.x = this.bgGraphics.x;
      this.dotsContainer.y = bubbleY;
    } else {
      this.bgGraphics.x = 0;

      this.avatarContainer.x = this.bubbleWidth + avatarMargin;
      this.avatarContainer.y = bubbleY;

      this.nameText.x = this.bubbleWidth - this.nameText.width;
      this.nameText.y = 0;

      this.contentContainer.x = padding;
      this.contentContainer.y = bubbleY + padding;

      this.dotsContainer.x = 0;
      this.dotsContainer.y = bubbleY;
    }

    this.layoutWidth = this.bubbleWidth + avatarWidth + avatarMargin;
    this.layoutHeight = Math.max(
      bubbleY + bubbleHeight,
      bubbleY + avatarHeight,
    );
  }

  public get totalHeight(): number {
    return this.layoutHeight;
  }

  public get totalWidth(): number {
    return this.layoutWidth;
  }
}
