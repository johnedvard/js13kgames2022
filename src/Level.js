import { on, off } from 'kontra';

import { Brick } from './Brick';
import { CUT_ROPE, LEVEL_COMPLETE, PLAYER_DIED } from './gameEvents';
import { initGameHints } from './gameHints';
import { Goal } from './Goal';

import { levels } from './levels/levels';
import { showOverlay } from './menu';
import { mousePoints } from './mouseControls';
import { Player } from './Player';
import { Saw } from './Saw';
import { playDead } from './sound';
import { ongoingTouches } from './touchControls';
import { renderTutorial, updateTutorial } from './tutorial';
import { isBoxCollision, lineIntersection } from './utils';

export class Level {
  player;
  saws = [];
  goals = [];
  bricks = [];
  isLevelLoaded = false;
  isFirstRopeCut = false;
  isStopMotion = false;
  levelId;
  levelData;
  stopMotionTime = 10;
  stopMotionEllapsed = 0;
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
          showOverlay('thanks');
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
    this.createBricks(levelData);
    this.isLevelLoaded = true;
    initGameHints(this.levelId);
  }

  loadLevel(levelId) {
    return new Promise((resolve, reject) => {
      if (levels[levelId] && levels[levelId].p) {
        const levelData = levels[levelId];
        resolve(levelData);
      } else {
        reject(null);
      }
    });
  }

  render(ctx) {
    if (!this.isLevelLoaded) return;

    // TODO (johnedvard) Add to same array if pressing for space
    this.saws.forEach((saw) => {
      saw.render(ctx);
    });
    this.bricks.forEach((brick) => {
      brick.render(ctx);
    });
    this.player.render(ctx);
    this.goals.forEach((goal) => {
      goal.render(ctx);
    });
    renderTutorial(this, ctx);
  }

  update(dt) {
    if (!this.isLevelLoaded) return;

    if (this.isStopMotion) {
      this.stopMotionEllapsed += 1;
      if (this.stopMotionEllapsed >= this.stopMotionTime) {
        this.isStopMotion = false;
      }
      return;
    }
    this.checkCollisions();

    this.player.update(dt);
    this.saws.forEach((saw) => {
      saw.update(dt);
    });
    this.goals.forEach((goal) => {
      goal.update(dt);
    });
    this.bricks.forEach((brick) => {
      brick.update(dt);
    });
    updateTutorial(dt, this);
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

  listenForGameEvents() {
    on(PLAYER_DIED, this.onPlayerDied);
    on(LEVEL_COMPLETE, this.onLevelComplete);
    on(CUT_ROPE, this.onCutRope);
  }
  onCutRope = ({ rope }) => {
    if (this.isFirstRopeCut) return;
    this.isStopMotion = true;
    this.isFirstRopeCut = true;
    this.flashScreen();
  };
  onLevelComplete = () => {};

  flashScreen() {
    const canvasEl = document.getElementById('game-canvas');
    canvasEl.classList.add('flash');

    setTimeout(() => {
      requestAnimationFrame(() => {
        canvasEl.classList.remove('flash');
      });
    }, 50);
  }
  onPlayerDied = ({}) => {
    playDead();
    this.isFirstRopeCut = false;
    this.stopMotionEllapsed = 0;
    this.player.respawnPlayer();
    this.resertSaws();
    this.resetBricks();
  };

  resetBricks() {
    this.bricks.length = 0;
    this.createBricks(this.levelData);
  }

  resertSaws() {
    this.saws.length = 0;
    this.createSaws(this.levelData);
  }

  checkTouchCollision() {
    if (!ongoingTouches.length) return;
    const rope = this.player.rope;
    for (let i = 0; i < ongoingTouches.length - 1; i++) {
      for (let j = 0; j < rope.length - 1; j++) {
        if (
          lineIntersection(
            ongoingTouches[i],
            ongoingTouches[i + 1],
            rope.nodes[j],
            rope.nodes[j + 1]
          )
        ) {
          this.player.rope.cutRope(j);
        }
      }
    }
  }

  checkMouseCollision() {
    if (!mousePoints.length) return;
    const rope = this.player.rope;
    for (let i = 0; i < mousePoints.length - 1; i++) {
      for (let j = 0; j < rope.length - 1; j++) {
        if (
          lineIntersection(
            mousePoints[i],
            mousePoints[i + 1],
            rope.nodes[j],
            rope.nodes[j + 1]
          )
        ) {
          this.player.rope.cutRope(j);
        }
      }
    }
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
    this.checkTouchCollision();
    this.checkMouseCollision();
  }

  destroy() {
    off(PLAYER_DIED, this.onPlayerDied);
    off(LEVEL_COMPLETE, this.onLevelComplete);
    off(CUT_ROPE, this.onCutRope);
    if (this.player) {
      this.player.destroy();
    }
  }
}
