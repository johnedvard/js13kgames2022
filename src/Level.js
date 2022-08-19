import { Player } from './Player';
import { Saw } from './Saw';
import { BACK_FORTH } from './sawBehavior';

export class Level {
  player;
  saws = [];
  isLevelLoaded = false;
  constructor(levelId, { game }) {
    this.game = game;
    this.loadLevel(levelId).then((levelData) => {
      this.createPlayer(levelData);
      this.createSaws(levelData);
      this.isLevelLoaded = true;
    });
  }

  loadLevel(levelId) {
    return new Promise((resolve) => {
      let httpRequest = new XMLHttpRequest(); // asynchronous request
      httpRequest.open('GET', `/static/level/${levelId}.json`, true);
      httpRequest.send();
      httpRequest.addEventListener('readystatechange', function () {
        if (this.readyState === this.DONE) {
          // when the request has completed
          resolve(JSON.parse(this.response));
        }
      });
    });
  }

  render(ctx) {
    if (!this.isLevelLoaded) return;
    this.player.render(ctx);
    this.saws.forEach((saw) => {
      saw.render(ctx);
    });
  }

  update() {
    if (!this.isLevelLoaded) return;
    this.checkCollisions();
    this.player.update();
    this.saws.forEach((saw) => {
      saw.update();
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
      this.saws.push(new Saw(saw.x, saw.y, { behavior: BACK_FORTH }));
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
            { x: saw.x - 5, y: saw.y },
            { x: saw.x + 5, y: saw.y },
            { x: rope[i].x, y: rope[i].y },
            { x: rope[i + 1].x, y: rope[i + 1].y }
          )
        ) {
          this.player.cutRope(i);
        }
      });
    }
  }
}
