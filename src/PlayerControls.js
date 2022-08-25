import { keyPressed, onInput } from 'kontra';

export class PlayerControls {
  player;
  constructor(player) {
    this.player = player;
    this.initControls();
  }

  updateControls() {
    if (this.player.isRopeCut) return;
    // TODO (johnedvard) add support for touch gesture and gamepad (if enough space)
    if (keyPressed('arrowleft')) {
      this.player.applyForce(-2.5, -1);
      this.player.changePlayerDirection(true);
    }
    if (keyPressed('arrowright')) {
      this.player.applyForce(2.5, -1);
      this.player.changePlayerDirection(false);
    }
    if (keyPressed('arrowup')) {
      this.player.climbRope();
    }
    if (keyPressed('space')) {
      this.player.applyForce(0, -10);
    }
  }

  initControls() {
    onInput(['c'], () => this.player.cutRope(0));
  }
}
