import * as PIXI from "pixi.js";
import enemyImg from "../../assets/sprites/enemy/enemy.png";
import { ENEMY_DATA } from "../../assets/sprites/enemy/data";
import Model from "./model";

const ENEMIES = {
  zombie: "bigZombieRun",
  demon: "bigDemonRun",
};

const CACHE = {};

class Enemy extends Model {
  constructor(game, id) {
    super(game);
    this.hitBox = null;
    this.init = this.init.bind(this);
    this.createSpriteSheet = this.createSpriteSheet.bind(this);
    this.setRandomPosition = this.setRandomPosition.bind(this);
    this.followPlayerDirection = this.followPlayerDirection.bind(this);
    this.cooldown = false;
    this.lastAttackTime = 0;
    this.movementSpeedMultiplier = -0.8;
    this.id = id;
  }

  async init(enemy) {
    const spriteSheet = await this.createSpriteSheet(enemyImg, ENEMY_DATA);
    const enemySprite = ENEMIES[enemy];
    const anim = new PIXI.AnimatedSprite(spriteSheet.animations[enemySprite]);
    this.initHitBox(anim._texture.orig.width, anim._texture.orig.height);
    anim.anchor.set(0.5);
    anim.animationSpeed = 0.1;
    this.anim = anim;
    this.game.stage.addChild(this.anim);
    this.setRandomPosition();
    anim.play();
  }

  followPlayerDirection() {
    if (this.anim.position.x - this.game.player.anim.position.x < 0) {
      this.directions[1] = 1;
    } else {
      this.directions[1] = -1;
    }
    if (this.anim.position.y - this.game.player.anim.position.y < 0) {
      this.directions[0] = 1;
    } else {
      this.directions[0] = -1;
    }
  }

  setRandomPosition() {
    const pct = Math.random();
    let x;
    let y;
    if (pct <= 0.25) {
      x = 0;
      y = window.innerHeight * Math.random();
    } else if (0.25 < pct && pct <= 0.5) {
      x = window.innerWidth;
      y = window.innerHeight * Math.random();
    } else if (0.5 < pct && pct <= 0.75) {
      x = window.innerWidth * Math.random();
      y = 0;
    } else if (0.75 < pct && pct <= 1) {
      x = window.innerWidth * Math.random();
      y = window.innerHeight;
    }
    this._move(x, y);
  }

  async createSpriteSheet(img, data) {
    if (data.meta.image in CACHE) {
      return CACHE[data.meta.image];
    }
    const texture = PIXI.BaseTexture.from(img);
    const spriteSheet = new PIXI.Spritesheet(texture, data);
    await spriteSheet.parse();
    CACHE[data.meta.image] = spriteSheet;
    return spriteSheet;
  }

  damage(health) {
    this.health -= health;
    if (this.health <= 0) {
      this.onDeath();
    }
  }

  destroy() {
    this.anim.destroy();
    this.hitBox.destroy();
  }

  render() {
    if (this.anim) {
      // might not be initiated yet
      this.followPlayerDirection();
      this.move();
      if (
        !this.cooldown &&
        this.game.detectCollision(this.game.player.hitBox, this.hitBox)
      ) {
        this.game.player.damage(20);
        this.cooldown = true;
        setTimeout(() => {
          this.cooldown = false;
        }, 1000);
      }
    }
  }
}

export default Enemy;
