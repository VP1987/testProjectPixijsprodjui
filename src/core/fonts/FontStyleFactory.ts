import * as PIXI from "pixi.js";

export function createOutlineStyle(
  fontId: string,
  size: number,
  outlineColor: number,
): PIXI.TextStyle {
  return new PIXI.TextStyle({
    fontFamily: `${fontId}Raw`,
    fontSize: size,
    fill: outlineColor,
    stroke: 0x000000,
    strokeThickness: Math.round(size * 0.08),
    lineJoin: "round",
    dropShadow: true,
    dropShadowColor: "#000000",
    dropShadowAlpha: 0,
    dropShadowAngle: Math.PI / 2,
    dropShadowDistance: Math.round(size * 0.015),
  });
}

export function createFillStyle(
  fontId: string,
  size: number,
  fillColor: number,
): PIXI.TextStyle {
  return new PIXI.TextStyle({
    fontFamily: `${fontId}Raw`,
    fontSize: size,
    fill: fillColor,
    stroke: 0xffffff,
    strokeThickness: Math.round(size * 0.02),
    dropShadow: true,
    dropShadowColor: "#88111d",
    dropShadowBlur: 0,
    dropShadowAngle: Math.PI / 2,
    dropShadowDistance: Math.round(size * 0.015),
    dropShadowAlpha: 1,
  });
}
