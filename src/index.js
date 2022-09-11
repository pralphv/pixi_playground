import "./styles.css";
import * as PIXI from "pixi.js";
import Player from "./classes/player";
import Enemy from "./classes/Enemy";

class Game {
  constructor() {
    this.app = new PIXI.Renderer({
      resolution: window.devicePixelRatio || 1,
      resolution: 1,
      antialias: true,
      width: window.innerWidth,
      height: window.innerHeight,
    });
    document.body.appendChild(this.app.view);
    this.healthBarText = null;
    this.player = null;
    this.enemies = {};
    this.spawnerId = null;
    this.stage = new PIXI.Container();
    this.render = this.render.bind(this);
    this.start = this.start.bind(this);
    this.init = this.init.bind(this);
    this.enemyCount = 0;
    this.enemyKilled = 0;
    this.lost = false;
  }

  initHealthBar() {
    this.healthBarText = new PIXI.Text(`Health: ${this.player.health}`, {
      fontSize: 35,
      fill: "white",
      align: "center",
    });
    this.healthBarText.position.x = this.app.width * 0.1;
    this.stage.addChild(this.healthBarText);
  }

  initEnemyKilledCount() {
    this.enemyKilledText = new PIXI.Text(`Killed: ${this.enemyKilled}`, {
      fontSize: 35,
      fill: "white",
      align: "center",
    });
    this.enemyKilledText.position.x = this.app.width * 0.7;
    this.stage.addChild(this.enemyKilledText);
  }

  async init() {
    this.player = new Player(this);
    this.initHealthBar();
    this.initEnemyKilledCount();
    for (let i = 0; i <= 10; i++) {
      await this.spawnEnemy();
    }
    this.player.onDamaged = (health) => {
      if (health <= 0) {
        this.lost = true;
        this.player.die();
        const lostText = new PIXI.Text("You Lose", {
          fontSize: 100,
          fill: "white",
          align: "center",
        });
        lostText.position.x = this.app.width / 2;
        lostText.position.y = this.app.height / 2;
        lostText.anchor.set(0.5);
        this.stage.addChild(lostText);
      }
    };
    this.spawner();
  }

  async spawnEnemy() {
    const enemy = new Enemy(this, this.enemyCount);
    if (Math.random() <= 0.5) {
      await enemy.init("demon");
    } else {
      await enemy.init("zombie");
    }
    this.enemies[this.enemyCount] = enemy;
    enemy.onDeath = () => {
      enemy.destroy();
      this.enemyKilled += 1;
      delete this.enemies[enemy.id];
      this.enemyKilledText.text = `Killed: ${this.enemyKilled}`
    };
    this.enemyCount += 1;
    return enemy;
  }

  spawner() {
    this.spawnerId = setInterval(async () => {
      await this.spawnEnemy();
    }, 1000);
  }

  render() {
    // console.log(PIXI.Ticker.shared.lastTime)
    this.app.render(this.stage);
  }

  start() {
    PIXI.Ticker.shared.add(() => {
      this.healthBarText.text = `Health: ${this.player.health}`;
      this.player?.render();
      for (const key in this.enemies) {
        this.enemies[key]?.render();
      }
      this.render();
    });
  }

  detectCollision(a, b) {
    if (a && b) {
      const ab = a.getBounds();
      const bb = b.getBounds();
      return (
        ab.x + ab.width > bb.x &&
        ab.x < bb.x + bb.width &&
        ab.y + ab.height > bb.y &&
        ab.y < bb.y + bb.height
      );
    }
  }
}

async function main() {
  const game = new Game();
  await game.init();
  game.start();
}
main();
