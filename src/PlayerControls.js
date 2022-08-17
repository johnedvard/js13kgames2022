import { keyPressed, onInput } from 'kontra';

export class PlayerControls {
  player;
  constructor(player) {
    this.player = player;
    this.initControls();
  }

  updateControls() {
    // TODO (johnedvard) add support for touch gesture and gamepad (if enough space)
    if (keyPressed('arrowleft')) {
      this.player.applyForce(-1.5, 0);
      this.player.changePlayerDirection(true);
    }
    if (keyPressed('arrowright')) {
      this.player.applyForce(1.5, 0);
      this.player.changePlayerDirection(false);
    }
  }

  initControls() {
    onInput(['space'], this.player.toggleRope);
    onInput(['c'], () => this.player.cutRope(3));
  }
}
