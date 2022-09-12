import { init, initInput, GameLoop, on } from './kontra';
import {
  RESTART_LEVEL,
  START_LEVEL,
  START_NEXT_LEVEL,
  TOGGLE_MUSIC,
} from './gameEvents';
import { Level } from './Level';
import { playSong, stopSong } from './sound';
import { setGameHeight, setGameWidth } from './store';

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
    initInput();
    setGameHeight(canvas.height);
    setGameWidth(canvas.width);

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

  listenForGameEvents() {
    on(START_NEXT_LEVEL, this.onStartNextLevel);
    on(START_LEVEL, this.onStartLevel);
    on(RESTART_LEVEL, this.onReStartLevel);
    on(TOGGLE_MUSIC, this.onToggleMusic);
  }
  onToggleMusic = ({ isMusicOn = false }) => {
    if (isMusicOn) {
      playSong();
    } else {
      stopSong();
    }
  };
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
