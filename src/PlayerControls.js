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
    }
    if (keyPressed('arrowright')) {
      this.player.applyForce(1.5, 0);
    }
  }

  initControls() {
    onInput(['space'], this.toggleRope);
  }

  toggleRope = (e) => {
    // TODO (johnedvard) Maybe use state machine
    if (this.player.hasRope()) {
      this.player.removeRope();
    } else {
      this.player.shootRope();
    }
  };
}
