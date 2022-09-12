import { BounceBoard } from './BounceBoard';
import { Brick } from './Brick';
import { HEART_PICKUP, LEVEL_COMPLETE, PLAYER_DIED } from './gameEvents';
import { initGameHints } from './gameHints';
import { Goal } from './Goal';
import { Heart } from './Heart';
import { on } from './kontra';
import { Player } from './Player';
import { Saw } from './Saw';
import { playDead } from './sound';
import { isBoxCollision } from './utils';

export class Level {
  player;
  saws = [];
  goals = [];
  hearts = [];
  bricks = [];
  bounceBoards = [];
  isLevelLoaded = false;
  levelId;
  levelData;
  capturedHearts = [];
  constructor({ game, levelId, levelData }) {
    this.levelId = levelId;
    this.levelData = levelData;
    this.game = game;
    if (levelData) {
      setTimeout(() => {
        // XXX Using settimout to avoid runtime error for some reason
        this.init(levelData);
      });
    } else {
      this.loadLevel('level' + levelId)
        .then((levelData) => {
          this.init(levelData);
        })
        .catch(() => {
          // TODO (johnedvard) improve error handling, not always assume last level
        });
    }
    this.listenForGameEvents();
  }

  init(levelData) {
    this.levelData = levelData;
    this.createPlayer(levelData);
    this.createSaws(levelData);
    this.createGoals(levelData);
    this.createHearts(levelData);
    this.createBricks(levelData);
    this.createBounceBoards(levelData);
    this.isLevelLoaded = true;
    initGameHints(this.levelId);
  }

  loadLevel(levelId) {
    return new Promise((resolve, reject) => {
      let httpRequest = new XMLHttpRequest();
      httpRequest.open('GET', `/level/${levelId}.json`, true);
      httpRequest.send();
      httpRequest.addEventListener('readystatechange', function () {
        if (this.readyState == this.DONE) {
          try {
            const levelData = JSON.parse(this.response);
            resolve(levelData);
          } catch (err) {
            reject(err);
          }
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
    this.bounceBoards.forEach((board) => {
      board.render(ctx);
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
    this.bounceBoards.forEach((board) => {
      board.update();
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
    if (!levelData.s) return;
    levelData.s.forEach((saw) => {
      // TODO (johnedvard) Add actual saw behaviour
      this.saws.push(
        new Saw(saw.x, saw.y, {
          level: this,
          behavior: saw.b,
          distance: saw.d,
        })
      );
    });
  }

  createHearts(levelData) {
    if (!levelData.h) return;
    levelData.h.forEach((heart) => {
      this.hearts.push(new Heart(heart.x, heart.y, { level: this }));
    });
  }

  createBricks(levelData) {
    if (!levelData.b) return;
    levelData.b.forEach((brick) => {
      this.bricks.push(
        new Brick(brick.x, brick.y, {
          behavior: brick.b,
          distance: brick.d,
          level: this,
        })
      );
    });
  }

  createBounceBoards(levelData) {
    if (!levelData.bb) return;
    levelData.bb.forEach((board) => {
      this.bounceBoards.push(
        new BounceBoard({ p1: board.p1, p2: board.p2, level: this })
      );
    });
  }

  storeCapturedHearts() {
    localStorage.setItem('hearts-' + this.levelId, this.capturedHearts.length);
  }

  listenForGameEvents() {
    on(PLAYER_DIED, this.onPlayerDied);
    on(HEART_PICKUP, this.onHeartPickup);
    on(LEVEL_COMPLETE, this.onLevelComplete);
  }
  onLevelComplete = () => {
    this.storeCapturedHearts();
  };
  onHeartPickup = ({ heart }) => {
    this.capturedHearts.push(heart);
  };
  onPlayerDied = ({}) => {
    playDead();
    this.player.respawnPlayer();
    this.resetHearts();
    this.resertSaws();
    this.resetBricks();
  };

  resetBricks() {
    this.bricks.length = 0;
    this.createBricks(this.levelData);
  }

  resetHearts() {
    this.capturedHearts.length = 0;
    this.hearts.length = 0;
    this.createHearts(this.levelData);
  }
  resertSaws() {
    this.saws.length = 0;
    this.createSaws(this.levelData);
  }

  // TODO (johnedvard) Move collisions to own file?
  checkCollisions() {
    const rope = this.player.rope;
    for (let i = 0; i < rope.length - 2; i++) {
      this.saws.forEach((saw) => {
        if (
          isBoxCollision(rope.nodes[i], {
            width: saw.width * saw.scale,
            height: saw.height * saw.scale,
            ...saw,
          })
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
