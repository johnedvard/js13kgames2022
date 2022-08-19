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
        game.checkCollisions();
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

  // TODO (johnedvard) Move collisions to own file?
  checkCollisions() {
    const rope = this.level.player.rope;
    for (let i = 0; i < rope.length - 2; i++) {
      this.level.saws.forEach((saw) => {
        if (
          // TODO (johnedvard) add to y-axis if saw is up down
          lineIntersection(
            { x: saw.x - 5, y: saw.y },
            { x: saw.x + 5, y: saw.y },
            { x: rope[i].x, y: rope[i].y },
            { x: rope[i + 1].x, y: rope[i + 1].y }
          )
        ) {
          this.level.player.cutRope(i);
        }
      });
    }
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
