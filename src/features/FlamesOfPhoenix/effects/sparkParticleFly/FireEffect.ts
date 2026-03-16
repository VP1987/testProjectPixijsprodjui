import * as PIXI from "pixi.js";
import { TextureFactory } from "@/core/infrastructure/TextureFactory";
import { AssetLoader } from "@/core/systems/AssetLoader";
import { FireEffectConfig as FC } from "./FireEffectConfig";

const SHEET_KEY = "fire-effect";
const FRAME_NAMES = [
  "Layer 1",
  "Layer 2",
  "Layer 3",
  "Layer 4",
  "Layer 5",
  "Layer 6",
  "Layer 7",
  "Layer 8",
  "Layer 9",
  "Layer 10",
  "Layer 11",
  "Layer 12",
  "Layer 13",
  "Layer 14",
  "Layer 15",
  "Layer 16",
  "Layer 17",
  "Layer 18",
];

interface Particle {
  sprite: PIXI.Sprite;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  frameIndex: number;
  frameTimer: number;
  rotSpeed: number;
}


import { ParticleCounter } from "@/core/systems/debug/ParticleCounter";

export class FireEffect {
  private particles: Particle[] = [];
  private layer: PIXI.Container;
  private frames: PIXI.Texture[] = [];
  private usesSpritesheet = false;

  private originX = 0;
  private originY = 0;
  private dynamicScale = 1.0;

  constructor(_app: PIXI.Application, layer: PIXI.Container) {
    this.layer = layer;
    this.resolveTextures();
    this.spawnParticles();
    ParticleCounter.register(this);
  }

  public getParticleCount(): number {
    return this.particles.length;
  }

  setPosition(x: number, y: number): void {
    this.originX = x;
    this.originY = y;
    this.particles.forEach((p) => {
      p.sprite.x = x;
      p.sprite.y = y;
      p.life = Math.random() * p.maxLife;
    });
  }

  setScale(bgScale: number): void {
    this.dynamicScale = bgScale;
  }
private resolveTextures(): void {
  const sheet = AssetLoader.getSpriteSheet(SHEET_KEY);
  if (sheet) {
    this.frames = FRAME_NAMES.map((n) => sheet.textures[n]).filter(Boolean);
    this.usesSpritesheet = true;
  } else {

      this.frames = [
        TextureFactory.glowParticle(FC.textureSizeLarge, FC.starPoints),
        TextureFactory.glowParticle(FC.textureSizeSmall, FC.starPoints),
      ];
      this.usesSpritesheet = false;
    }
  }

  private makeParticle(): Particle {
    const frameIndex = Math.floor(Math.random() * this.frames.length);
    const sprite = new PIXI.Sprite(this.frames[frameIndex]);

    sprite.anchor.set(0.5, 1.0);
    sprite.blendMode =
      FC.blendMode === "ADD" ? PIXI.BLEND_MODES.ADD : PIXI.BLEND_MODES.NORMAL;
    sprite.x = this.originX;
    sprite.y = this.originY;

    if (FC.randomRotation) {
      sprite.rotation = Math.random() * Math.PI * 2;
    }

    this.layer.addChild(sprite);
    return {
      sprite,
      vx: (Math.random() - 0.5) * FC.velocityX,
      vy: -(
        Math.random() * (FC.velocityYMax - FC.velocityYMin) +
        FC.velocityYMin
      ),
      life: Math.random() * FC.lifeMax,
      maxLife: Math.random() * (FC.lifeMax - FC.lifeMin) + FC.lifeMin,
      frameIndex,
      frameTimer: 0,
      rotSpeed: FC.rotationSpeed * (Math.random() > 0.5 ? 1 : -1),
    };
  }

  private spawnParticles(): void {
    for (let i = 0; i < FC.count; i++) {
      this.particles.push(this.makeParticle());
    }
  }

  update(delta: number): void {
    this.particles.forEach((p) => {
      p.life += delta;

      if (p.life >= p.maxLife) {
        p.sprite.x = this.originX;
        p.sprite.y = this.originY;
        p.vx = (Math.random() - 0.5) * FC.velocityX;
        p.vy = -(
          Math.random() * (FC.velocityYMax - FC.velocityYMin) +
          FC.velocityYMin
        );
        p.life = 0;
        p.frameTimer = 0;
        if (FC.randomRotation) p.sprite.rotation = Math.random() * Math.PI * 2;
      }

      p.sprite.x += p.vx * delta;
      p.sprite.y += p.vy * delta;

      if (FC.rotationSpeed !== 0) {
        p.sprite.rotation += p.rotSpeed * delta;
      }

      const t = p.life / p.maxLife;
      const lifeCurve = Math.sin(t * Math.PI);

      p.sprite.alpha = lifeCurve * FC.alphaMax;
      p.sprite.scale.set(FC.baseScale * this.dynamicScale);

      if (this.usesSpritesheet) {
        p.frameTimer += delta;
        const frameDuration = 1 / FC.frameRate;
        if (p.frameTimer >= frameDuration) {
          p.frameTimer -= frameDuration;
          p.frameIndex = (p.frameIndex + 1) % this.frames.length;
          p.sprite.texture = this.frames[p.frameIndex];
        }
      } else {
        const sr = (FC.colorStart >> 16) & 0xff;
        const sg = (FC.colorStart >> 8) & 0xff;
        const sb = FC.colorStart & 0xff;
        const er = (FC.colorEnd >> 16) & 0xff;
        const eg = (FC.colorEnd >> 8) & 0xff;
        const eb = FC.colorEnd & 0xff;
        p.sprite.tint =
          (Math.round(sr + (er - sr) * t) << 16) |
          (Math.round(sg + (eg - sg) * t) << 8) |
          Math.round(sb + (eb - sb) * t);
      }
    });
  }
  destroy(): void {
    this.particles.forEach((p) => p.sprite.destroy());
    this.particles = [];
    ParticleCounter.unregister(this);
  }
}
