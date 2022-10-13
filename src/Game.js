import { init, initInput, GameLoop, on } from 'kontra';

import {
  AD_FINISHED,
  AD_PLAYING,
  LEVEL_QUIT,
  RESTART_LEVEL,
  START_LEVEL,
  START_NEXT_LEVEL,
  TOGGLE_MUSIC,
} from './gameEvents';
import { Level } from './Level';
import { playSong, stopSong } from './sound';
import { setGameHeight, setGameWidth } from './store';
import { showOverlay } from './menu';

export class Game {
  canvas;
  context;
  player;
  saw;
  level;
  isAdPlaying;
  constructor() {
    const game = this;
    let { canvas, context } = init();
    context.textBaseline = 'middle';
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.imageSmoothingEnabled = false;
    this.canvas = canvas;
    this.context = context;
    initInput();
    setGameHeight(canvas.height);
    setGameWidth(canvas.width);

    let loop = GameLoop({
      update: function (dt) {
        if (game.isAdPlaying) return;
        if (!game.level) return;
        game.level.update(dt);
      },
      render: function () {
        if (game.isAdPlaying) return;
        if (!game.level) return;
        context.save();
        game.level.render(context);
      },
    });

    loop.start(); // start the game
    this.listenForGameEvents();
  }

  loadLevel({ levelId, levelData }) {
    if (this.level) {
      this.level.destroy();
    }
    if (levelId) {
      this.level = new Level({ levelId, game: this });
    } else if (levelData) {
      this.level = new Level({ game: this, levelData });
    }
  }

  listenForGameEvents() {
    on(START_NEXT_LEVEL, this.onStartNextLevel);
    on(START_LEVEL, this.onStartLevel);
    on(RESTART_LEVEL, this.onReStartLevel);
    on(TOGGLE_MUSIC, this.onToggleMusic);
    on(LEVEL_QUIT, this.onLevelQuit);
    on(AD_FINISHED, this.onAdFinished);
    on(AD_PLAYING, this.onAdPlaying);
  }
  onAdPlaying = () => {
    this.isAdPlaying = true;
  };
  onAdFinished = () => {
    this.isAdPlaying = false;
  };
  onToggleMusic = ({ isMusicOn = false }) => {
    if (isMusicOn) {
      playSong();
    } else {
      stopSong();
    }
  };
  onStartNextLevel = () => {
    this.level.destroy();
    if (this.level.levelId) {
      this.loadLevel({ levelId: this.level.levelId + 1 });
    } else {
      // TODO (johnedvard) figure out a way to go to next level instead of going back to list
      // NEAR level go back to menu
      showOverlay('near-levels');
    }
  };
  onStartLevel = ({ levelId, levelData }) => {
    this.loadLevel({ levelId, levelData });
  };
  onReStartLevel = () => {
    this.loadLevel({
      levelId: this.level.levelId,
      levelData: this.level.levelData,
    });
  };
  onLevelQuit = () => {
    if (this.level) {
      this.level.destroy();
    }
  };
}
