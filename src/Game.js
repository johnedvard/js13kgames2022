import { init, initPointer, initInput, GameLoop, onPointer } from 'kontra';
import { Player } from './Player';

export class Game {
  canvas;
  context;
  player;
  constructor() {
    const game = this;
    let { canvas, context } = init();
    this.canvas = canvas;
    this.context = context;
    initPointer();
    initInput();
    this.createPlayer();

    let loop = GameLoop({
      update: function () {
        game.player.update();
      },
      render: function () {
        game.player.render(context);
      },
    });
    loop.start(); // start the game
    this.addPointerListeners();
  }

  createPlayer() {
    this.player = new Player(40, 40, this);
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
