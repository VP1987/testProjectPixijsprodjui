import * as PIXI from "pixi.js";
import { CardStackManager } from "@/core/cards/deck/CardStackManager";
import { StackPlaceholderBuilder } from "@/core/cards/layout/StackPlaceholderBuilder";
import { TableLayout } from "@/core/layout/TableLayout";
import { cardStackYOffsetPx } from "@/features/AceOfShadows/constants";

export class AceOfShadowsLayoutManager {
  private cardStackManager: CardStackManager;
  private container: PIXI.Container;
  private placeholderA: PIXI.Graphics;
  private placeholderB: PIXI.Graphics;

  public cardW: number = 0;
  public cardH: number = 0;
  public stackAPos = { x: 0, y: 0 };
  public stackBPos = { x: 0, y: 0 };

  constructor(
    cardStackManager: CardStackManager,
    container: PIXI.Container,
    placeholderA: PIXI.Graphics,
    placeholderB: PIXI.Graphics,
  ) {
    this.cardStackManager = cardStackManager;
    this.container = container;
    this.placeholderA = placeholderA;
    this.placeholderB = placeholderB;
  }

  public syncLayoutState(layout: any): void {
    this.cardW = layout.cardW;
    this.cardH = layout.cardH;
    this.stackAPos = { x: layout.stackAPos.x, y: layout.stackAPos.y };
    this.stackBPos = { x: layout.stackBPos.x, y: layout.stackBPos.y };
  }

  public updateStackVisuals(
    stackId: string,
    pos: { x: number; y: number },
    scale: number,
  ): void {
    this.cardStackManager.getStack(stackId).forEach((card, i) => {
      card.sprite.scale.set(scale);
      card.sprite.x = pos.x;
      card.sprite.y = pos.y - i * cardStackYOffsetPx;
    });
  }

  public updatePlaceholders(): void {
    [this.placeholderA, this.placeholderB].forEach((p) => {
      p.width = this.cardW;
      p.height = this.cardH;
    });
    this.placeholderA.position.set(this.stackAPos.x, this.stackAPos.y);
    this.placeholderB.position.set(this.stackBPos.x, this.stackBPos.y);
  }

  public apply(
    viewportLogicalSize: { width: number; height: number },
    cardTextureWidth: number,
  ): void {
    this.computeAndSyncLayout(viewportLogicalSize);

    const scaleValue = this.cardW / cardTextureWidth;

    this.updateStackVisuals("stackA", this.stackAPos, scaleValue);
    this.updateStackVisuals("stackB", this.stackBPos, scaleValue);

    this.updatePlaceholders();
  }

  public computeAndSyncLayout(viewportLogicalSize: {
    width: number;
    height: number;
  }): any {
    const layout = TableLayout.compute(
      viewportLogicalSize.width,
      viewportLogicalSize.height,
    );
    this.syncLayoutState(layout);
    return layout;
  }

  public initializePlaceholders(
    w: number,
    h: number,
  ): { placeholderA: PIXI.Graphics; placeholderB: PIXI.Graphics } {
    const result = StackPlaceholderBuilder.build(
      this.container,
      this.cardW,
      this.cardH,
      w,
      h,
    );
    this.placeholderA = result.placeholderA;
    this.placeholderB = result.placeholderB;
    return result;
  }
}
