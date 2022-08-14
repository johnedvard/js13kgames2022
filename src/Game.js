import { init, Sprite, GameLoop } from 'kontra';

export class Game {
  constructor() {
    let { canvas, context } = init();
    let loop = GameLoop({
      update: function () {},
      render: function () {},
    });
    loop.start(); // start the game
  }
}
