import { Player } from './Player';
import { Saw } from './Saw';
import { BACK_FORTH } from './sawBehavior';

export class Level {
  player;
  saws = [];
  constructor(levelId, { game }) {
    this.game = game;
    this.createPlayer();
    this.createSaw();
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
  createSaw() {
    this.saws.push(new Saw(100, 200, { behavior: BACK_FORTH }));
  }
}
