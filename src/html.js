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
        <!-- <button id="select-level-btn">Select Level</button> -->
        <button id="play-now-btn" class="svg-btn"><div class="svg-placeholder"></div><span id="play-now-txt">Play Now</span></button>
        <!-- <button id="bonus-content-btn">Bonus Content</button> -->
        <button id="music-btn" class="svg-btn"><div class="svg-placeholder"></div><span id="music-on-off">Music is OFF</span></button>
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
        <span id="level-over-msg"></span>
        <button id="next-btn" class="svg-btn">
          <div class="svg-placeholder"></div>
          <span id="play-next-txt">Play next level</span>
        </button>
      </menu>
      <div id="thanks" class="overlay hide">
        Rest in peace my soul.
        <br />
        Thank you for playing.
      </div>
      <div id="hint"></div>
    </div>`;
  document.getElementById('hang-by-a-thread').innerHTML = html;
};
