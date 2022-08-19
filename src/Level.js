import { Player } from './Player';
import { Saw } from './Saw';
import { BACK_FORTH } from './sawBehavior';

export class Level {
  player;
  saws = [];
  constructor(levelId, { game }) {
    this.game = game;
    this.loadLevel(levelId).then((levelData) => {
      this.createPlayer();
      this.createSaws();
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
    this.player.render(ctx);
    this.saws.forEach((saw) => {
      saw.render(ctx);
    });
  }

  update() {
    this.player.update();
    this.saws.forEach((saw) => {
      saw.update();
    });
  }
  createPlayer() {
    this.player = new Player(40, 40, { game: this.game });
  }
  createSaws() {
    this.saws.push(new Saw(100, 200, { behavior: BACK_FORTH }));
  }
}
