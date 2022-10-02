import {
  emit,
  gamepadAxis,
  gamepadPressed,
  keyPressed,
  onGamepad,
  onInput,
} from 'kontra';

import { RESTART_LEVEL } from './gameEvents';

export class PlayerControls {
  player;
  constructor(player) {
    this.player = player;
    this.initControls();
  }

  updateControls() {
    if (
      this.player.hasWon ||
      this.player.isRopeCut ||
      this.player.rope.length <= 0
    )
      return;
    // TODO (johnedvard) add support for touch gesture and gamepad (if enough space)
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
    if (keyPressed('arrowup') || keyPressed('w') || gamepadPressed('dpadup')) {
      this.player.climbRope();
    }
    if (keyPressed('space') || gamepadPressed('south')) {
      this.player.applyForce(0, -5);
    }
  }

  cutRope() {
    this.player.rope.cutRope(Math.floor(this.player.rope.length / 2));
  }

  initControls() {
    onInput(['s'], () => this.cutRope());
    onGamepad('west', () => this.cutRope());
    onInput(['z'], () => emit(RESTART_LEVEL));
  }
}
