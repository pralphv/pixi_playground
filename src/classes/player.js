import * as PIXI from "pixi.js";
import img from "../../assets/sprites/samurai/texture.png";
import { SAMURAI } from "../../assets/sprites/samurai/data";
import Model from "./model";

class Player extends Model {
  constructor(game) {
    super(game);
    this.health = 100;
    this.anim = null;
    this.init = this.init.bind(this);
    this.startKeyboard = this.startKeyboard.bind(this);
    this.stop = this.stop.bind(this);
    this.handleOnKeyDown = this.handleOnKeyDown.bind(this);
    this.handleOnKeyUp = this.handleOnKeyUp.bind(this);
    this.startMove = this.startMove.bind(this);
    this.attack_ = this.attack_.bind(this);
    this.status = 0; // idle, moving, attacking
    this.charSprites = [null, null, null]; // idle, moving
    this.onDamaged = null;
    this.lastStatus = 0; // for caching attack
    this.hitBox = null; // rect
    this.attackBox = null; // rect
    this.attacking = false;
    this.attackCollision = this.attackCollision.bind(this);

    this.init();
    this.startKeyboard();
  }

  async init() {
    const texture = PIXI.BaseTexture.from(img);
    const spriteSheet = new PIXI.Spritesheet(texture, SAMURAI);
    await spriteSheet.parse();
    this.charSprites = [
      spriteSheet.animations.idle,
      spriteSheet.animations.run,
      spriteSheet.animations.attack,
    ];
    const anim = new PIXI.AnimatedSprite(this.charSprites[0]);
    anim.onComplete = () => {
      this.attacking = false;
      if (this.directions[0] !== 0 || this.directions[1] !== 0) {
        this.swapTexture(1);
      } else {
        this.swapTexture(0);
      }
      this.anim.onFrameChange = null;
      this.attackBox.visible = false;
    };
    this.initHitBox(
      anim._texture.trim.width - 10,
      anim._texture.trim.height - 20
    );
    this.initAttackBox(anim._texture.trim.width, anim._texture.trim.height);
    anim.anchor.set(0.5);
    anim.animationSpeed = 0.1;
    this.anim = anim;
    this._move(this.game.app.width / 2, this.game.app.height / 2);
    this.game.stage.addChild(this.anim);
    anim.play();
    this.startAttack();

    setInterval(() => {
      if (this.health < 100) {
        this.recoverHealth();
      }
    }, 1000);
  }

  attack_() {
    this.attacking = true;
    this.anim.onFrameChange = (frame) => {
      if (frame === 2) {
        this.attackBox.visible = true;
        this.attackCollision();
      }
    };
    this.swapTexture(2);
  }

  attackCollision() {
    for (const key in this.game.enemies) {
      if (
        this.game.detectCollision(this.attackBox, this.game.enemies[key].hitBox)
      ) {
        this.game.enemies[key].damage(50);
      }
    }
  }

  initAttackBox(width, height) {
    this.attackBox = PIXI.Sprite.from(PIXI.Texture.WHITE);
    this.attackBox.width = width + 50;
    this.attackBox.height = height + 30;
    this.attackBox.tint = 0xff000;
    this.attackBox.visible = false;
    this.attackBox.alpha = 0;
    this.attackBox.anchor.set(0, 0.7);
    this.game.stage.addChild(this.attackBox);
  }

  startAttack() {
    this.attackItervalId = setInterval(() => {
      this.attack_();
    }, 2000);
  }

  stopAttackInterval() {
    window.clearInterval(this.attackItervalId);
  }

  damage(damage) {
    this.health -= damage;
    this.onDamaged?.(this.health);
  }

  startKeyboard() {
    window.addEventListener("keydown", this.handleOnKeyDown);
    window.addEventListener("keyup", this.handleOnKeyUp);
  }

  handleOnKeyDown(e) {
    if (e.code === "ArrowDown") {
      this.directions[0] = 1;
    } else if (e.code === "ArrowUp") {
      this.directions[0] = -1;
    } else if (e.code === "ArrowLeft") {
      this.flip(-1);
      this.directions[1] = -1;
    } else if (e.code === "ArrowRight") {
      this.flip(1);
      this.directions[1] = 1;
    }
    if (this.status === 0) {
      this.startMove();
    }
  }

  handleOnKeyUp(e) {
    if (e.code === "ArrowDown" && this.directions[0] === 1) {
      this.directions[0] = 0;
    } else if (e.code === "ArrowUp" && this.directions[0] === -1) {
      this.directions[0] = 0;
    } else if (e.code === "ArrowLeft" && this.directions[1] === -1) {
      this.directions[1] = 0;
    } else if (e.code === "ArrowRight" && this.directions[1] === 1) {
      this.directions[1] = 0;
    }
    if (this.directions[0] === 0 && this.directions[1] === 0) {
      this.stop();
    }
  }
  die() {
    this.stopAttackInterval();
    this.stop();
    window.removeEventListener("keydown", this.handleOnKeyDown);
    window.removeEventListener("keyup", this.handleOnKeyUp);
  }

  startMove() {
    this.status = 1;
    this.swapTexture(1);
  }

  stop() {
    this.status = 0;
    this.swapTexture(0);
  }

  swapTexture(i) {
    if (!this.attacking || i === 2) {
      // dont let attack stop
      this.anim.textures = this.charSprites[i];
      this.anim.play();
      this.anim.loop = true;
    }
    if (i === 2) {
      this.anim.loop = false;
    }
  }

  recoverHealth() {
    this.health += 5;
  }

  render() {
    if (this.status === 1 && !this.attacking) {
      this.move();
    }
  }
}

export default Player;
