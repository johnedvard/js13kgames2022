import { init, initInput, GameLoop, on } from 'kontra';

import {
  AD_FINISHED,
  AD_PLAYING,
  LEVEL_COMPLETE,
  LEVEL_QUIT,
  RESTART_LEVEL,
  START_LEVEL,
  START_NEXT_LEVEL,
  TOGGLE_MUSIC,
} from './gameEvents';
import { Level } from './Level';
import { initSound, toggleSound } from './sound';
import { setGameHeight, setGameWidth } from './store';
import { showOverlay } from './menu';
import { PLAYER_DEAD } from './PlayerState';
import { drawDragline, initTouchControls } from './touchControls';
import { scaleToFitHandler } from './utils';

export class Game {
  canvas;
  context;
  player;
  saw;
  level;
  isAdPlaying;
  deathCount;
  setDeathCount;
  updateLevelsCompleted;
  constructor({ deathCount, setDeathCount, updateLevelsCompleted }) {
    this.deathCount = deathCount || 0;
    this.updateLevelsCompleted = updateLevelsCompleted || (() => {});
    this.setDeathCount = setDeathCount || (() => {});
    const game = this;
    let { canvas, context } = init();
    context.textBaseline = 'middle';
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.imageSmoothingEnabled = false;
    this.canvas = canvas;
    this.context = context;
    initInput();
    initSound();
    initTouchControls();
    scaleToFitHandler();
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
        drawDragline(context);
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
    on(PLAYER_DEAD, this.onPlayerDead);
    on(LEVEL_COMPLETE, this.onLevelComplete);
  }
  onLevelComplete = () => {
    const levelKey = `level${this.level.levelId}`;
    localStorage.setItem(levelKey, true);
    this.updateLevelsCompleted({ [levelKey]: true });
  };
  onPlayerDead = () => {
    this.setDeathCount(++this.deathCount);
  };
  onAdPlaying = () => {
    this.isAdPlaying = true;
  };
  onAdFinished = () => {
    this.isAdPlaying = false;
  };
  onToggleMusic = () => {
    toggleSound();
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
