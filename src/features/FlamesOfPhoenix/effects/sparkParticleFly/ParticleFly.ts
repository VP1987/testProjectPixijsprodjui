import * as PIXI from "pixi.js";
import { TextureFactory } from "@/core/infrastructure/TextureFactory";
import { AssetLoader } from "@/core/systems/AssetLoader";
import { ParticleConfig as PC } from "./ParticleConfig";

const SHEET_KEY = "spark-effect";
const FRAME_NAMES = [
  "Frame_1",
  "Frame_2",
  "Frame_3",
  "Frame_4",
  "Frame_5",
  "Frame_6",
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

export class ParticleFly {
  private particles: Particle[] = [];
  private layer: PIXI.Container;
  private frames: PIXI.Texture[] = [];
  private usesSpritesheet = false;

  private originX = 0;
  private originY = 0;
  private spawnWidth = 0;
  private spawnHeight = 0;
  private dynamicScale = 1.0;

  constructor(
    _app: PIXI.Application,
    layer: PIXI.Container,
    width: number = 0,
    height: number = 0,
  ) {
    this.layer = layer;
    this.spawnWidth = width;
    this.spawnHeight = height;

    this.resolveTextures();
    this.spawnParticles();
    ParticleCounter.register(this);
  }

  public getParticleCount(): number {
    return this.particles.length;
  }

  setPosition(x: number, y: number): void {
    const dx = x - this.originX;
    const dy = y - this.originY;

    this.particles.forEach((p) => {
      p.sprite.x += dx;
      p.sprite.y += dy;
    });

    this.originX = x;
    this.originY = y;
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
        TextureFactory.glowParticle(PC.textureSizeLarge, PC.starPoints),
        TextureFactory.glowParticle(PC.textureSizeSmall, PC.starPoints),
      ];
      this.usesSpritesheet = false;
    }
  }

  private resetParticlePosition(p: Particle): void {
    p.sprite.x = this.originX + (Math.random() - 0.5) * this.spawnWidth;
    p.sprite.y = this.originY + (Math.random() - 0.5) * this.spawnHeight;
  }

  private makeParticle(): Particle {
    const frameIndex = Math.floor(Math.random() * this.frames.length);
    const sprite = new PIXI.Sprite(this.frames[frameIndex]);

    sprite.anchor.set(0.5);
    sprite.blendMode =
      PC.blendMode === "ADD" ? PIXI.BLEND_MODES.ADD : PIXI.BLEND_MODES.NORMAL;

    if (PC.randomRotation) {
      sprite.rotation = Math.random() * Math.PI * 2;
    }

    this.layer.addChild(sprite);

    const particle = {
      sprite,
      vx: (Math.random() - 0.5) * PC.velocityX,
      vy: -(
        Math.random() * (PC.velocityYMax - PC.velocityYMin) +
        PC.velocityYMin
      ),
      life: Math.random() * PC.lifeMax,
      maxLife: Math.random() * (PC.lifeMax - PC.lifeMin) + PC.lifeMin,
      frameIndex,
      frameTimer: 0,
      rotSpeed: PC.rotationSpeed * (Math.random() > 0.5 ? 1 : -1),
    };

    this.resetParticlePosition(particle);
    return particle;
  }

  private spawnParticles(): void {
    for (let i = 0; i < PC.count; i++) {
      this.particles.push(this.makeParticle());
    }
  }

  update(delta: number): void {
    this.particles.forEach((p) => {
      p.life += delta;

      if (p.life >= p.maxLife) {
        this.resetParticlePosition(p);
        p.vx = (Math.random() - 0.5) * PC.velocityX;
        p.vy = -(
          Math.random() * (PC.velocityYMax - PC.velocityYMin) +
          PC.velocityYMin
        );
        p.life = 0;
        p.frameTimer = 0;
        if (PC.randomRotation) p.sprite.rotation = Math.random() * Math.PI * 2;
      }

      p.sprite.x += p.vx * delta;
      p.sprite.y += p.vy * delta;
      p.sprite.rotation += p.rotSpeed * delta;

      const t = p.life / p.maxLife;
      const lifeCurve = Math.sin(t * Math.PI);
      const pulse = 1.0 + PC.pulseAmount * Math.sin(p.life * PC.pulseSpeed);

      p.sprite.alpha = lifeCurve * PC.alphaMax;
      p.sprite.scale.set(
        Math.max(0.001, PC.baseScale * this.dynamicScale * lifeCurve * pulse),
      );

      if (this.usesSpritesheet) {
        p.frameTimer += delta;
        const frameDuration = 1 / PC.frameRate;
        if (p.frameTimer >= frameDuration) {
          p.frameTimer -= frameDuration;
          p.frameIndex = (p.frameIndex + 1) % this.frames.length;
          p.sprite.texture = this.frames[p.frameIndex];
        }
      } else {
        const sr = (PC.colorStart >> 16) & 0xff;
        const sg = (PC.colorStart >> 8) & 0xff;
        const sb = PC.colorStart & 0xff;
        const er = (PC.colorEnd >> 16) & 0xff;
        const eg = (PC.colorEnd >> 8) & 0xff;
        const eb = PC.colorEnd & 0xff;
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
