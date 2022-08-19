import { init, initPointer, initInput, GameLoop, onPointer } from 'kontra';
import { Level } from './Level';
import { lineIntersection } from './utils';

export class Game {
  canvas;
  context;
  player;
  saw;
  level;
  constructor() {
    const game = this;
    let { canvas, context } = init();
    this.canvas = canvas;
    this.context = context;
    initPointer();
    initInput();
    this.addPointerListeners();

    this.loadLevel('level1');

    let loop = GameLoop({
      update: function () {
        game.level.update();
      },
      render: function () {
        game.level.render(game.context);
      },
    });

    loop.start(); // start the game
  }

  loadLevel(levelId) {
    this.level = new Level(levelId, { game: this });
  }

  addPointerListeners() {
    onPointer('down', () => {
      this.isDragging = true;
    });
    onPointer('up', () => {
      this.isDragging = false;
    });
  }
}
