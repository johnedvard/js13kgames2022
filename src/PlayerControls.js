import {
  emit,
  gamepadPressed,
  keyPressed,
  offGamepad,
  offInput,
  onGamepad,
  onInput,
} from 'kontra';

import { RESTART_LEVEL } from './gameEvents';
import { isMenuVisible } from './menu';
import { displaySnackbar } from './snackbar';

export class PlayerControls {
  player;
  constructor(player) {
    this.player = player;
    this.initControls();
  }

  updateControls() {
    if (
      keyPressed('arrowleft') ||
      keyPressed('a') ||
      gamepadPressed('dpadleft')
    ) {
      this.player.applyForce(-1.5, -1);
      this.player.changePlayerDirection(true);
    }
    if (
      keyPressed('arrowright') ||
      keyPressed('d') ||
      gamepadPressed('dpadright')
    ) {
      this.player.applyForce(1.5, -1);
      this.player.changePlayerDirection(false);
    }
    if (keyPressed('space') || gamepadPressed('south')) {
      this.player.applyForce(0, -5);
    }
  }

  cutRope = () => {
    this.player.rope.cutRope(Math.floor(this.player.rope.length / 2));
  };

  displaySnackbar = () => {
    displaySnackbar();
  };
  initControls() {
    onInput(['s'], this.cutRope);
    // Only add when we want to debug
    onInput(['v'], this.displaySnackbar);
    // onInput(['z'], this.restartLevel);
    onGamepad('west', this.cutRope);
  }

  restartLevel = () => {
    emit(RESTART_LEVEL);
  };

  destroy = () => {
    offInput(['s'], this.cutRope);
    offGamepad('west', this.cutRope);
    // offInput(['v'], this.displaySnackbar);
    // offInput(['z'], this.restartLevel);
  };
}
