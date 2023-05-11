import { init, initInput, GameLoop, on, off } from 'kontra';

import {
  AD_FINISHED,
  AD_PLAYING,
  DISPLAY_GAME_OVER,
  LEVEL_COMPLETE,
  LEVEL_QUIT,
  RESTART_LEVEL,
  START_LEVEL,
  START_NEXT_LEVEL,
  TOGGLE_MUSIC,
} from './gameEvents';
import { Level } from './Level';
import { initSound, stopSong, toggleSound } from './sound';
import { setGameHeight, setGameWidth } from './store';
import { destroyMenu, showOverlay } from './menu';
import { drawDragline, initTouchControls } from './touchControls';
import { scaleToFitHandler } from './utils';
import { setItem } from './storage';
import {
  drawMouseLine,
  initMouseControls,
  updateMouseControls,
} from './mouseControls';
import { resetTutorial } from './tutorial';

export class Game {
  canvas;
  context;
  player;
  level;
  isAdPlaying;
  updateLevelsCompleted;
  setDeathCountInParent;
  loop;

  constructor({ setDeathCount, updateLevelsCompleted }) {
    this.setDeathCountInParent = setDeathCount || (() => {});
    this.updateLevelsCompleted = updateLevelsCompleted || (() => {});
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
    initMouseControls();
    scaleToFitHandler();
    setGameHeight(canvas.height);
    setGameWidth(canvas.width);

    this.loop = GameLoop({
      update: function (dt) {
        if (game.isAdPlaying) return;
        if (!game.level) return;
        updateMouseControls(dt);
        game.level.update(dt);
      },
      render: function () {
        if (game.isAdPlaying) return;
        if (!game.level) return;
        context.save();
        game.level.render(context);
        drawDragline(context);
        drawMouseLine(context);
      },
    });

    this.loop.start(); // start the game
    this.listenForGameEvents();
  }

  loadLevel({ levelId, levelData }) {
    if (this.level) {
      this.level.destroy();
    }
    if (levelId) {
      this.level = new Level({
        levelId,
        game: this,
        setDeathCountInParent: this.setDeathCountInParent,
      });
    } else if (levelData) {
      this.level = new Level({
        game: this,
        levelData,
        setDeathCountInParent: this.setDeathCountInParent,
      });
    }
  }

  listenForGameEvents() {
    if (this.isListenersCreated) return;
    this.isListenersCreated = true;
    on(START_NEXT_LEVEL, this.onStartNextLevel);
    on(START_LEVEL, this.onStartLevel);
    on(RESTART_LEVEL, this.onReStartLevel);
    on(TOGGLE_MUSIC, this.onToggleMusic);
    on(LEVEL_QUIT, this.onLevelQuit);
    on(AD_FINISHED, this.onAdFinished);
    on(AD_PLAYING, this.onAdPlaying);
    on(LEVEL_COMPLETE, this.onLevelComplete);
    on(DISPLAY_GAME_OVER, this.onLevelGameOver);
  }

  destroyGame() {
    console.log('destroy game');
    this.isListenersCreated = false;
    off(START_NEXT_LEVEL, this.onStartNextLevel);
    off(START_LEVEL, this.onStartLevel);
    off(RESTART_LEVEL, this.onReStartLevel);
    off(TOGGLE_MUSIC, this.onToggleMusic);
    off(LEVEL_QUIT, this.onLevelQuit);
    off(AD_FINISHED, this.onAdFinished);
    off(AD_PLAYING, this.onAdPlaying);
    off(LEVEL_COMPLETE, this.onLevelComplete);
    off(DISPLAY_GAME_OVER, this.onLevelGameOver);
    this.loop.stop();
    stopSong();
    destroyMenu();
    resetTutorial();
    if (this.level) {
      this.level.destroy();
    }
  }

  onLevelComplete = () => {
    const levelKey = `level${this.level.levelId}`;
    setItem(levelKey, true);
    this.updateLevelsCompleted({ [levelKey]: true });
    if (this.level.levelId === 6) {
      stopSong();
    }
  };
  onLevelGameOver = () => {
    const levelKey = `level${this.level.levelId}`;
    setItem(levelKey, false);
    this.updateLevelsCompleted({ [levelKey]: false });
    if (this.level.levelId === 6) {
      stopSong();
    }
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
