import * as PIXI from "pixi.js";
import { CardEntity } from "@/core/cards/domain/CardEntity";

export class CardViewModel {
  entity: CardEntity;
  sprite: PIXI.Container;

  private back: PIXI.Sprite;
  private face: PIXI.Sprite;

  private rankTL: PIXI.Sprite;
  private rankBR: PIXI.Sprite;

  private suitTL: PIXI.Sprite;
  private suitBR: PIXI.Sprite;

  backTexture: PIXI.Texture;
  faceTexture: PIXI.Texture;
  rankTexture: PIXI.Texture;
  suitTexture: PIXI.Texture;

  private readonly rankPadding = { x: 0.14, y: 0.11 };
  private readonly suitOffset = { x: 0, y: 0.15 };

  constructor(
    entity: CardEntity,
    backTexture: PIXI.Texture,
    faceTexture: PIXI.Texture,
    rankTexture: PIXI.Texture,
    suitTexture: PIXI.Texture,
    scale: number,
  ) {
    this.entity = entity;

    this.backTexture = backTexture;
    this.faceTexture = faceTexture;
    this.rankTexture = rankTexture;
    this.suitTexture = suitTexture;

    this.sprite = new PIXI.Container();

    this.back = new PIXI.Sprite(this.backTexture);
    this.face = new PIXI.Sprite(this.faceTexture);

    this.back.anchor.set(0.5);
    this.face.anchor.set(0.5);

    this.rankTL = new PIXI.Sprite(this.rankTexture);
    this.rankTL.anchor.set(0.5);
    this.rankTL.scale.set(0.65);

    this.rankBR = new PIXI.Sprite(this.rankTexture);
    this.rankBR.anchor.set(0.5);
    this.rankBR.rotation = Math.PI;
    this.rankBR.scale.set(0.65);

    this.suitTL = new PIXI.Sprite(this.suitTexture);
    this.suitTL.anchor.set(0.5);
    this.suitTL.scale.set(1.25);

    this.suitBR = new PIXI.Sprite(this.suitTexture);
    this.suitBR.anchor.set(0.5);
    this.suitBR.rotation = Math.PI;
    this.suitBR.scale.set(1.25);

    this.sprite.addChild(
      this.back,
      this.face,
      this.rankTL,
      this.rankBR,
      this.suitTL,
      this.suitBR,
    );

    this.sprite.scale.set(scale);

    this.updatePositions();
    this.sync();
  }

  private updatePositions() {
    const w = this.backTexture.width;
    const h = this.backTexture.height;

    const rankX = -w / 2 + w * this.rankPadding.x;
    const rankY = -h / 2 + h * this.rankPadding.y;

    const suitX = rankX + w * this.suitOffset.x;
    const suitY = rankY + h * this.suitOffset.y;

    this.rankTL.position.set(rankX, rankY);
    this.suitTL.position.set(suitX, suitY);

    this.rankBR.position.set(-rankX, -rankY);
    this.suitBR.position.set(-suitX, -suitY);
  }

  get renderSprite(): PIXI.Sprite {
    return this.entity.isFaceUp ? this.face : this.back;
  }

  sync(): void {
    const isFace = this.entity.isFaceUp;

    this.face.renderable = isFace;
    this.rankTL.renderable = isFace;
    this.rankBR.renderable = isFace;
    this.suitTL.renderable = isFace;
    this.suitBR.renderable = isFace;

    this.back.renderable = !isFace;
  }
}
