import { init, initPointer, initInput, GameLoop, onPointer, on } from 'kontra';
import { LEVEL_COMPLETE } from './gameEvents';
import { Level } from './Level';
import { playSong } from './sound';
import { setGameHeight, setGameWidth } from './store';

export class Game {
  canvas;
  context;
  player;
  saw;
  level;
  constructor() {
    // TODO (johnedvard) Play song after user interraction
    // playSong();

    const game = this;
    let { canvas, context } = init();
    this.canvas = canvas;
    this.context = context;
    initPointer();
    initInput();
    setGameHeight(canvas.height);
    setGameWidth(canvas.width);
    this.addPointerListeners();

    this.loadLevel(1);

    let loop = GameLoop({
      update: function () {
        game.level.update();
      },
      render: function () {
        game.level.render(game.context);
      },
    });

    loop.start(); // start the game
    this.listenForGameEvents();
  }

  loadLevel(levelId) {
    console.log('load level', levelId);
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

  listenForGameEvents() {
    on(LEVEL_COMPLETE, this.onLevelComplete);
  }
  onLevelComplete = () => {
    this.level.destroy();
    this.loadLevel(this.level.levelId + 1);
  };
}
