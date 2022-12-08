export const initHtml = () => {
  const html = `
  <div id="wrap">
      <div id="loading-wrapper" class="overlay hide">
        <div id="loading"></div>
      </div>
      <canvas id="game-canvas" width="800px" height="800px"> </canvas>
      <div id="r-menu" class="menu">
        <div id="hamburger">––</div>
      </div>
      <menu id="main" class="overlay">
        <button id="select-level-btn">Select Level</button>
        <!-- <button id="near-login-loading-btn">Loading..</button>
        <button id="near-level-btn" class="disabled" disabled>
          NEAR Levels
        </button> -->
        <!-- <button id="bonus-content-btn">Bonus Content</button> -->
        <button id="music-btn" class="flat">Music is OFF</button>
      </menu>
      <div id="bonus" class="overlay hide">
        <div id="coil-subscriber" class="hide">
          Thanks for subscribing to Coil
        </div>

        <span id="coil-btn">Access more hats for Coil subscribers</span>
        <div id="bonus-grid"></div>
      </div>
      <div id="levels" class="overlay hide">
        <div id="levels-grid"></div>
      </div>
      <div id="near-levels" class="overlay hide">
        <div id="loading-near-levels">Loading NEAR levels..</div>
        <div id="near-levels-grid"></div>
      </div>
      <menu id="level-dialog" class="overlay hide">
        <button id="next-btn">Play next level</button>
        <button id="replay-btn">Replay level</button>
      </menu>
      <div id="thanks" class="overlay hide">
        Rest in peace my soul
        <br />
        Thank you for playing
      </div>
      <div id="hint"></div>
      <div id="touch-controls">
        <button id="touch-left">Left</button>
        <button id="touch-boost">Boost</button>
        <button id="touch-right">Right</button>
      </div>
    </div>`;
  document.getElementById('hang-by-a-thread').innerHTML = html;
};
