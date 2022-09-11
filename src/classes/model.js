import * as PIXI from "pixi.js";

class Model {
  constructor(game) {
    this.game = game;
    this.flip = this.flip.bind(this);
    this.directions = [0, 0];
    this.anim = null;
    this.hitBox = null;
    this.attackBox = null;
    this.status = 1; // only player class will change
    this.movementSpeed = 1;
    this.movementSpeedMultiplier = 1;
    this.health = 100;
    // this.attack = null;
  }

  initHitBox(width, height) {
    this.hitBox = PIXI.Sprite.from(PIXI.Texture.WHITE);
    this.hitBox.anchor.set(0.5);
    this.hitBox.width = width;
    this.hitBox.height = height;
    this.hitBox.alpha = 0;
    this.game.stage.addChild(this.hitBox);
  }

  _move(x, y) {
    this.anim.position.set(x, y);
    this.hitBox.position.x = x;
    this.hitBox.position.y = y;
    if (this.attackBox) {
      this.attackBox.position.x = x;
      this.attackBox.position.y = y;
    }
  }

  flip(i) {
    const hitBoxWidth = this.hitBox.width;
    const attackBoxWidth = this.attackBox.width;
    this.anim.scale.x = i;
    this.attackBox.scale.x = i;
    this.hitBox.scale.x = i;
    this.hitBox.width = hitBoxWidth;
    this.attackBox.width = attackBoxWidth;
  }

  move() {
    if (this.directions[0] === 1) {
      this._move(
        this.anim.position.x,
        this.anim.position.y +
          this.movementSpeed * (1 + this.movementSpeedMultiplier)
      );
    } else if (this.directions[0] === -1) {
      this._move(
        this.anim.position.x,
        this.anim.position.y -
          this.movementSpeed * (1 + this.movementSpeedMultiplier)
      );
    }
    if (this.directions[1] === 1) {
      this._move(
        this.anim.position.x +
          this.movementSpeed * (1 + this.movementSpeedMultiplier),
        this.anim.position.y
      );
    } else if (this.directions[1] === -1) {
      this._move(
        this.anim.position.x -
          this.movementSpeed * (1 + this.movementSpeedMultiplier),
        this.anim.position.y
      );
    }
  }

  render() {
    if (this.status === 1) {
      this.move();
    }
  }
}

export default Model;
