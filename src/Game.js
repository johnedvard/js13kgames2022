import {
  init,
  initPointer,
  initInput,
  GameLoop,
  onPointer,
  on,
} from './kontra';
import { RESTART_LEVEL, START_LEVEL, START_NEXT_LEVEL } from './gameEvents';
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
        context.save();
        game.level.render(game.context);
      },
    });

    loop.start(); // start the game
    this.listenForGameEvents();
  }

  loadLevel({ levelId, levelData }) {
    if (levelId) {
      this.level = new Level({ levelId, game: this });
    } else if (levelData) {
      this.level = new Level({ game: this, levelData: JSON.parse(levelData) });
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

  listenForGameEvents() {
    on(START_NEXT_LEVEL, this.onStartNextLevel);
    on(START_LEVEL, this.onStartLevel);
    on(RESTART_LEVEL, this.onReStartLevel);
  }
  onStartNextLevel = () => {
    this.level.destroy();
    this.loadLevel({ levelId: this.level.levelId + 1 });
  };
  onStartLevel = ({ levelId, levelData }) => {
    if (this.level) {
      this.level.destroy();
    }
    this.loadLevel({ levelId, levelData });
  };
  onReStartLevel = () => {
    this.loadLevel({
      levelId: this.level.levelId,
      levelData: this.level.levelData,
    });
  };
}
