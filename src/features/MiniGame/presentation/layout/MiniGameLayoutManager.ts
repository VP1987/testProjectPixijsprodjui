import * as PIXI from "pixi.js";
import { TableauNode } from "@/features/MiniGame/domain/SolitaireLogic";
import { TableLayout } from "@/core/layout/TableLayout";
import { CardViewModel } from "@/core/cards/components/CardViewModel";

export interface LayoutSettings {
  cardScale: number;
  tableauStartY: number;
  bottomPileY: number;
  horizontalPadding: number;
  verticalOverlap: number;
}

export class MiniGameLayoutManager {
  private static readonly CONFIG = {
    portrait: {
      cardScale: 0.52,
      tableauStartY: 0.08,
      bottomPileY: 0.94,
      horizontalPadding: 15,
      verticalOverlap: 0.45
    },
    landscape: {
      cardScale: 0.65,
      tableauStartY: 0.15,
      bottomPileY: 0.85,
      horizontalPadding: 20,
      verticalOverlap: 0.55
    }
  };

  public cardW: number = 0;
  public cardH: number = 0;
  public activePilePos = { x: 0, y: 0 };
  public drawPilePos = { x: 0, y: 0 };

  private centerX: number = 0;
  private startY: number = 0;
  private currentSettings!: LayoutSettings;

  public computeAndSyncLayout(viewportLogicalSize: { width: number; height: number }): void {
    const layout = TableLayout.compute(viewportLogicalSize.width, viewportLogicalSize.height);
    const isPortrait = viewportLogicalSize.height > viewportLogicalSize.width;
    
    this.currentSettings = isPortrait ? MiniGameLayoutManager.CONFIG.portrait : MiniGameLayoutManager.CONFIG.landscape;

    this.cardW = layout.cardW * this.currentSettings.cardScale;
    this.cardH = layout.cardH * this.currentSettings.cardScale;

    this.centerX = viewportLogicalSize.width / 2;
    this.startY = viewportLogicalSize.height * this.currentSettings.tableauStartY;

    const bottomY = viewportLogicalSize.height * this.currentSettings.bottomPileY;

    this.activePilePos = {
      x: this.centerX,
      y: bottomY,
    };

    this.drawPilePos = {
      x: this.centerX - this.cardW * 1.8,
      y: bottomY,
    };
  }

  public updateTableauVisuals(
    tableau: { node: TableauNode; viewModel: CardViewModel }[],
    scale: number,
    cardLayer: PIXI.Container
  ): void {
    const faceDownCards: { node: TableauNode; viewModel: CardViewModel }[] = [];
    const faceUpCards: { node: TableauNode; viewModel: CardViewModel }[] = [];

    tableau.forEach((t) => {
      if (t.viewModel.entity.isFaceUp) {
        faceUpCards.push(t);
      } else {
        faceDownCards.push(t);
      }
    });

    const sortedTableau = [...faceDownCards, ...faceUpCards];
    const horizontalStep = this.cardW + this.currentSettings.horizontalPadding;
    const verticalStep = this.cardH * this.currentSettings.verticalOverlap;

    sortedTableau.forEach(({ node, viewModel }) => {
      viewModel.sprite.scale.set(scale);
      viewModel.sprite.x = this.centerX + node.x * horizontalStep;
      viewModel.sprite.y = this.startY + node.y * verticalStep;
      
      cardLayer.addChild(viewModel.sprite);
    });
  }

  public updateDrawPileVisuals(
    drawPile: CardViewModel[],
    scale: number,
  ): void {
    drawPile.forEach((viewModel) => {
      viewModel.sprite.scale.set(scale);
      viewModel.sprite.x = this.drawPilePos.x;
      viewModel.sprite.y = this.drawPilePos.y;
    });
  }

  public updateDiscardPileVisuals(
    discardPile: CardViewModel[],
    scale: number,
  ): void {
    discardPile.forEach((viewModel) => {
      viewModel.sprite.scale.set(scale);
      viewModel.sprite.x = this.activePilePos.x;
      viewModel.sprite.y = this.activePilePos.y;
    });
  }

  public apply(
    viewportLogicalSize: { width: number; height: number },
    cardTextureWidth: number,
    tableau: { node: TableauNode; viewModel: CardViewModel }[],
    drawPile: CardViewModel[],
    discardPile: CardViewModel[],
    cardLayer: PIXI.Container
  ): void {
    this.computeAndSyncLayout(viewportLogicalSize);

    const scaleValue = this.cardW / cardTextureWidth;

    this.updateTableauVisuals(tableau, scaleValue, cardLayer);
    this.updateDrawPileVisuals(drawPile, scaleValue);
    this.updateDiscardPileVisuals(discardPile, scaleValue);
  }
}
