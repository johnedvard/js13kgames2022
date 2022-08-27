import { emit, keyPressed, onInput } from 'kontra';
import { RESTART_LEVEL } from './gameEvents';

export class PlayerControls {
  player;
  constructor(player) {
    this.player = player;
    this.initControls();
  }

  updateControls() {
    if (this.player.isRopeCut || this.player.rope.length <= 0) return;
    // TODO (johnedvard) add support for touch gesture and gamepad (if enough space)
    if (keyPressed('arrowleft')) {
      this.player.applyForce(-1.5, -1);
      this.player.changePlayerDirection(true);
    }
    if (keyPressed('arrowright')) {
      this.player.applyForce(1.5, -1);
      this.player.changePlayerDirection(false);
    }
    if (keyPressed('arrowup')) {
      this.player.climbRope();
    }
    if (keyPressed('space')) {
      this.player.applyForce(0, -5);
    }
  }

  initControls() {
    onInput(['c'], () => this.player.rope.cutRope(0));
    onInput(['r'], () => emit(RESTART_LEVEL));
  }
}
