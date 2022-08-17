import { init, initPointer, initInput, GameLoop, onPointer } from 'kontra';
import { Player } from './Player';
import { Saw } from './Saw';
import { lineIntersection } from './utils';
import { BACK_FORTH } from './sawBehavior';

export class Game {
  canvas;
  context;
  player;
  saw;
  constructor() {
    const game = this;
    let { canvas, context } = init();
    this.canvas = canvas;
    this.context = context;
    initPointer();
    initInput();
    this.createPlayer();
    this.createSaw();

    let loop = GameLoop({
      update: function () {
        game.player.update();
        game.saw.update();
        game.checkCollisions();
      },
      render: function () {
        game.player.render(context);
        game.saw.render(context);
      },
    });
    loop.start(); // start the game
    this.addPointerListeners();
  }

  createPlayer() {
    this.player = new Player(40, 40, this);
  }
  createSaw() {
    this.saw = new Saw(100, 200, { behavior: BACK_FORTH });
  }
  checkCollisions() {
    const rope = this.player.rope;
    for (let i = 0; i < rope.length - 2; i++) {
      if (
        lineIntersection(
          { x: this.saw.x - 1, y: this.saw.y },
          { x: this.saw.x + 1, y: this.saw.y },
          { x: rope[i].x, y: rope[i].y },
          { x: rope[i + 1].x, y: rope[i + 1].y }
        )
      ) {
        console.log('intersection happened at index: ', i);
        this.player.cutRope(i);
      }
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
