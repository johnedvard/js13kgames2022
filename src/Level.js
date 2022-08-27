import { Brick } from './Brick';
import { Goal } from './Goal';
import { Heart } from './Heart';
import { Player } from './Player';
import { Saw } from './Saw';
import { lineIntersection } from './utils';

export class Level {
  player;
  saws = [];
  goals = [];
  hearts = [];
  bricks = [];
  isLevelLoaded = false;
  levelId = -1;
  constructor(levelId, { game }) {
    this.game = game;
    this.levelId = levelId;
    this.loadLevel('level' + levelId).then((levelData) => {
      this.createPlayer(levelData);
      this.createSaws(levelData);
      this.createGoals(levelData);
      this.createHearts(levelData);
      this.createBricks(levelData);
      this.isLevelLoaded = true;
    });
  }

  loadLevel(levelId) {
    return new Promise((resolve) => {
      let httpRequest = new XMLHttpRequest();
      httpRequest.open('GET', `/level/${levelId}.json`, true);
      httpRequest.send();
      httpRequest.addEventListener('readystatechange', function () {
        if (this.readyState === this.DONE) {
          resolve(JSON.parse(this.response));
        }
      });
    });
  }

  render(ctx) {
    if (!this.isLevelLoaded) return;

    // TODO (johnedvard) Add to same array if pressing for space
    this.saws.forEach((saw) => {
      saw.render(ctx);
    });
    this.hearts.forEach((heart) => {
      heart.render(ctx);
    });
    this.bricks.forEach((brick) => {
      brick.render(ctx);
    });
    this.player.render(ctx);
    this.goals.forEach((goal) => {
      goal.render(ctx);
    });
  }

  update() {
    if (!this.isLevelLoaded) return;
    this.checkCollisions();
    this.player.update();
    this.saws.forEach((saw) => {
      saw.update();
    });
    this.goals.forEach((goal) => {
      goal.update();
    });
    this.hearts.forEach((heart) => {
      heart.update();
    });
    this.bricks.forEach((brick) => {
      brick.update();
    });
  }

  createGoals(levelData) {
    levelData.g.forEach((g) => {
      this.goals.push(new Goal(g.x, g.y, { level: this }));
    });
  }

  createPlayer(levelData) {
    this.player = new Player({
      levelData,
      game: this.game,
    });
  }

  createSaws(levelData) {
    levelData.s.forEach((saw) => {
      // TODO (johnedvard) Add actual saw behaviour
      this.saws.push(new Saw(saw.x, saw.y, { level: this }));
    });
  }
  createHearts(levelData) {
    levelData.h.forEach((heart) => {
      this.hearts.push(new Heart(heart.x, heart.y, { level: this }));
    });
  }
  createBricks(levelData) {
    levelData.b.forEach((brick) => {
      this.bricks.push(new Brick(brick.x, brick.y, { level: this }));
    });
  }

  // TODO (johnedvard) Move collisions to own file?
  checkCollisions() {
    const rope = this.player.rope;
    for (let i = 0; i < rope.length - 2; i++) {
      this.saws.forEach((saw) => {
        if (
          // TODO (johnedvard) add to y-axis if saw is up down
          lineIntersection(
            { x: saw.x - 5, y: saw.y - 5 },
            { x: saw.x + 5, y: saw.y + 5 },
            { x: rope.nodes[i].x, y: rope.nodes[i].y },
            { x: rope.nodes[i + 1].x, y: rope.nodes[i + 1].y }
          )
        ) {
          this.player.rope.cutRope(i);
        }
      });
    }
  }

  destroy() {
    console.log('destroy level');
  }
}
