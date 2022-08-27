import { init, initPointer, initInput, GameLoop, onPointer, on } from 'kontra';
import { LEVEL_COMPLETE, RESTART_LEVEL, START_LEVEL } from './gameEvents';
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

    let loop = GameLoop({
      update: function () {
        if (!game.level) return;
        game.level.update();
      },
      render: function () {
        if (!game.level) return;
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
    on(START_LEVEL, this.onStartLevel);
    on(RESTART_LEVEL, this.onReStartLevel);
  }
  onLevelComplete = () => {
    this.level.destroy();
    this.loadLevel(this.level.levelId + 1);
  };
  onStartLevel = ({ levelId }) => {
    this.loadLevel(levelId);
  };
  onReStartLevel = () => {
    this.loadLevel(this.level.levelId);
  };
}
