let noop = () => {},
  srOnlyStyle =
    'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);';
function addToDom(t, e) {
  let i = e.parentNode;
  if ((t.setAttribute('data-kontra', ''), i)) {
    let s = i.querySelector('[data-kontra]:last-of-type') || e;
    i.insertBefore(t, s.nextSibling);
  } else document.body.appendChild(t);
}
function removeFromArray(t, e) {
  let i = t.indexOf(e);
  if (-1 != i) return t.splice(i, 1), !0;
}
let canvasEl,
  context,
  callbacks$2 = {};
function on(t, e) {
  (callbacks$2[t] = callbacks$2[t] || []), callbacks$2[t].push(e);
}
function off(t, e) {
  callbacks$2[t] = (callbacks$2[t] || []).filter((t) => t != e);
}
function emit(t, ...e) {
  (callbacks$2[t] || []).map((t) => t(...e));
}
let handler$1 = { get: (t, e) => '_proxy' == e || noop };
function getCanvas() {
  return canvasEl;
}
function getContext() {
  return context;
}
function init$1(t, { contextless: e = !1 } = {}) {
  if (
    ((canvasEl =
      document.getElementById(t) || t || document.querySelector('canvas')),
    e && (canvasEl = canvasEl || new Proxy({}, handler$1)),
    !canvasEl)
  )
    throw Error('You must provide a canvas element for the game');
  return (
    (context = canvasEl.getContext('2d') || new Proxy({}, handler$1)),
    (context.imageSmoothingEnabled = !1),
    emit('init'),
    { canvas: canvasEl, context: context }
  );
}
class Animation {
  constructor({ spriteSheet: t, frames: e, frameRate: i, loop: s = !0 }) {
    (this.spriteSheet = t),
      (this.frames = e),
      (this.frameRate = i),
      (this.loop = s);
    let { width: a, height: n, margin: r = 0 } = t.frame;
    (this.width = a),
      (this.height = n),
      (this.margin = r),
      (this._f = 0),
      (this._a = 0);
  }
  clone() {
    return new Animation(this);
  }
  reset() {
    (this._f = 0), (this._a = 0);
  }
  update(t = 1 / 60) {
    if (this.loop || this._f != this.frames.length - 1)
      for (this._a += t; this._a * this.frameRate >= 1; )
        (this._f = ++this._f % this.frames.length),
          (this._a -= 1 / this.frameRate);
  }
  render({
    x: t,
    y: e,
    width: i = this.width,
    height: s = this.height,
    context: a = getContext(),
  }) {
    let n = (this.frames[this._f] / this.spriteSheet._f) | 0,
      r = this.frames[this._f] % this.spriteSheet._f | 0;
    a.drawImage(
      this.spriteSheet.image,
      r * this.width + (2 * r + 1) * this.margin,
      n * this.height + (2 * n + 1) * this.margin,
      this.width,
      this.height,
      t,
      e,
      i,
      s
    );
  }
}
function factory$b() {
  return new Animation(...arguments);
}
let imageRegex = /(jpeg|jpg|gif|png|webp)$/,
  audioRegex = /(wav|mp3|ogg|aac)$/,
  leadingSlash = /^\//,
  trailingSlash = /\/$/,
  dataMap = new WeakMap(),
  imagePath = '',
  audioPath = '',
  dataPath = '';
function getUrl(t, e) {
  return new URL(t, e).href;
}
function joinPath(t, e) {
  return [t.replace(trailingSlash, ''), t ? e.replace(leadingSlash, '') : e]
    .filter((t) => t)
    .join('/');
}
function getExtension(t) {
  return t.split('.').pop();
}
function getName(t) {
  let e = t.replace('.' + getExtension(t), '');
  return 2 == e.split('/').length ? e.replace(leadingSlash, '') : e;
}
function getCanPlay(t) {
  return {
    wav: t.canPlayType('audio/wav; codecs="1"'),
    mp3: t.canPlayType('audio/mpeg;'),
    ogg: t.canPlayType('audio/ogg; codecs="vorbis"'),
    aac: t.canPlayType('audio/aac;'),
  };
}
let imageAssets = {},
  audioAssets = {},
  dataAssets = {};
function addGlobal() {
  window.__k ||
    (window.__k = { dm: dataMap, u: getUrl, d: dataAssets, i: imageAssets });
}
function setImagePath(t) {
  imagePath = t;
}
function setAudioPath(t) {
  audioPath = t;
}
function setDataPath(t) {
  dataPath = t;
}
function loadImage(t) {
  return (
    addGlobal(),
    new Promise((e, i) => {
      let s, a, n;
      if (((s = joinPath(imagePath, t)), imageAssets[s]))
        return e(imageAssets[s]);
      (a = new Image()),
        (a.onload = function () {
          (n = getUrl(s, window.location.href)),
            (imageAssets[getName(t)] = imageAssets[s] = imageAssets[n] = this),
            emit('assetLoaded', this, t),
            e(this);
        }),
        (a.onerror = function () {
          i('Unable to load image ' + s);
        }),
        (a.src = s);
    })
  );
}
function loadAudio(t) {
  return new Promise((e, i) => {
    let s,
      a,
      n,
      r,
      o = t;
    return (
      (s = new Audio()),
      (a = getCanPlay(s)),
      (t = []
        .concat(t)
        .reduce((t, e) => t || (a[getExtension(e)] ? e : null), 0))
        ? ((n = joinPath(audioPath, t)),
          audioAssets[n]
            ? e(audioAssets[n])
            : (s.addEventListener('canplay', function () {
                (r = getUrl(n, window.location.href)),
                  (audioAssets[getName(t)] =
                    audioAssets[n] =
                    audioAssets[r] =
                      this),
                  emit('assetLoaded', this, t),
                  e(this);
              }),
              (s.onerror = function () {
                i('Unable to load audio ' + n);
              }),
              (s.src = n),
              void s.load()))
        : i('cannot play any of the audio formats provided ' + o)
    );
  });
}
function loadData(t) {
  let e, i;
  return (
    addGlobal(),
    (e = joinPath(dataPath, t)),
    dataAssets[e]
      ? Promise.resolve(dataAssets[e])
      : fetch(e)
          .then((t) => {
            if (!t.ok) throw t;
            return t
              .clone()
              .json()
              .catch(() => t.text());
          })
          .then(
            (s) => (
              (i = getUrl(e, window.location.href)),
              'object' == typeof s && dataMap.set(s, i),
              (dataAssets[getName(t)] = dataAssets[e] = dataAssets[i] = s),
              emit('assetLoaded', s, t),
              s
            )
          )
  );
}
function load(...t) {
  return (
    addGlobal(),
    Promise.all(
      t.map((t) => {
        let e = getExtension([].concat(t)[0]);
        return e.match(imageRegex)
          ? loadImage(t)
          : e.match(audioRegex)
          ? loadAudio(t)
          : loadData(t);
      })
    )
  );
}
function degToRad(t) {
  return (t * Math.PI) / 180;
}
function radToDeg(t) {
  return (180 * t) / Math.PI;
}
function angleToTarget(t, e) {
  return Math.atan2(e.y - t.y, e.x - t.x) + Math.PI / 2;
}
function rotatePoint(t, e) {
  let i = Math.sin(e),
    s = Math.cos(e);
  return { x: t.x * s - t.y * i, y: t.x * i + t.y * s };
}
function movePoint(t, e, i) {
  return { x: t.x + Math.sin(e) * i, y: t.y - Math.cos(e) * i };
}
function randInt(t, e) {
  return ((Math.random() * (e - t + 1)) | 0) + t;
}
function seedRand(t) {
  for (var e = 0, i = 2166136261; e < t.length; e++)
    i = Math.imul(i ^ t.charCodeAt(e), 16777619);
  (i += i << 13), (i ^= i >>> 7), (i += i << 3), (i ^= i >>> 17);
  let s = (i += i << 5) >>> 0,
    a = () => ((2 ** 31 - 1) & (s = Math.imul(48271, s))) / 2 ** 31;
  return a(), a;
}
function lerp(t, e, i) {
  return t * (1 - i) + e * i;
}
function inverseLerp(t, e, i) {
  return (i - t) / (e - t);
}
function clamp(t, e, i) {
  return Math.min(Math.max(t, i), e);
}
function setStoreItem(t, e) {
  null == e
    ? localStorage.removeItem(t)
    : localStorage.setItem(t, JSON.stringify(e));
}
function getStoreItem(t) {
  let e = localStorage.getItem(t);
  try {
    e = JSON.parse(e);
  } catch (t) {}
  return e;
}
function collides(t, e) {
  return (
    ([t, e] = [t, e].map((t) => getWorldRect(t))),
    t.x < e.x + e.width &&
      t.x + t.width > e.x &&
      t.y < e.y + e.height &&
      t.y + t.height > e.y
  );
}
function getWorldRect(t) {
  let { x: e = 0, y: i = 0, width: s, height: a } = t.world || t;
  return (
    t.mapwidth && ((s = t.mapwidth), (a = t.mapheight)),
    t.anchor && ((e -= s * t.anchor.x), (i -= a * t.anchor.y)),
    s < 0 && ((e += s), (s *= -1)),
    a < 0 && ((i += a), (a *= -1)),
    { x: e, y: i, width: s, height: a }
  );
}
function depthSort(t, e, i = 'y') {
  return ([t, e] = [t, e].map(getWorldRect)), t[i] - e[i];
}
class Vector {
  constructor(t = 0, e = 0, i = {}) {
    (this.x = t),
      (this.y = e),
      i._c && (this.clamp(i._a, i._b, i._d, i._e), (this.x = t), (this.y = e));
  }
  add(t) {
    return new Vector(this.x + t.x, this.y + t.y, this);
  }
  subtract(t) {
    return new Vector(this.x - t.x, this.y - t.y, this);
  }
  scale(t) {
    return new Vector(this.x * t, this.y * t);
  }
  normalize(t = this.length()) {
    return new Vector(this.x / t, this.y / t);
  }
  dot(t) {
    return this.x * t.x + this.y * t.y;
  }
  length() {
    return Math.hypot(this.x, this.y);
  }
  distance(t) {
    return Math.hypot(this.x - t.x, this.y - t.y);
  }
  angle(t) {
    return Math.acos(this.dot(t) / (this.length() * t.length()));
  }
  clamp(t, e, i, s) {
    (this._c = !0), (this._a = t), (this._b = e), (this._d = i), (this._e = s);
  }
  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }
  set x(t) {
    this._x = this._c ? clamp(this._a, this._d, t) : t;
  }
  set y(t) {
    this._y = this._c ? clamp(this._b, this._e, t) : t;
  }
}
function factory$a() {
  return new Vector(...arguments);
}
class Updatable {
  constructor(t) {
    return this.init(t);
  }
  init(t = {}) {
    (this.position = factory$a()),
      (this.velocity = factory$a()),
      (this.acceleration = factory$a()),
      (this.ttl = 1 / 0),
      Object.assign(this, t);
  }
  update(t) {
    this.advance(t);
  }
  advance(t) {
    let e = this.acceleration;
    t && (e = e.scale(t)), (this.velocity = this.velocity.add(e));
    let i = this.velocity;
    t && (i = i.scale(t)),
      (this.position = this.position.add(i)),
      this._pc(),
      this.ttl--;
  }
  get dx() {
    return this.velocity.x;
  }
  get dy() {
    return this.velocity.y;
  }
  set dx(t) {
    this.velocity.x = t;
  }
  set dy(t) {
    this.velocity.y = t;
  }
  get ddx() {
    return this.acceleration.x;
  }
  get ddy() {
    return this.acceleration.y;
  }
  set ddx(t) {
    this.acceleration.x = t;
  }
  set ddy(t) {
    this.acceleration.y = t;
  }
  isAlive() {
    return this.ttl > 0;
  }
  _pc() {}
}
class GameObject extends Updatable {
  init({
    width: t = 0,
    height: e = 0,
    context: i = getContext(),
    render: s = this.draw,
    update: a = this.advance,
    children: n = [],
    anchor: r = { x: 0, y: 0 },
    opacity: o = 1,
    rotation: h = 0,
    scaleX: d = 1,
    scaleY: l = 1,
    ...c
  } = {}) {
    (this._c = []),
      super.init({
        width: t,
        height: e,
        context: i,
        anchor: r,
        opacity: o,
        rotation: h,
        scaleX: d,
        scaleY: l,
        ...c,
      }),
      (this._di = !0),
      this._uw(),
      this.addChild(n),
      (this._rf = s),
      (this._uf = a);
  }
  update(t) {
    this._uf(t), this.children.map((e) => e.update && e.update(t));
  }
  render() {
    let t = this.context;
    t.save(),
      (this.x || this.y) && t.translate(this.x, this.y),
      this.rotation && t.rotate(this.rotation),
      (1 == this.scaleX && 1 == this.scaleY) ||
        t.scale(this.scaleX, this.scaleY);
    let e = -this.width * this.anchor.x,
      i = -this.height * this.anchor.y;
    (e || i) && t.translate(e, i),
      (this.context.globalAlpha = this.opacity),
      this._rf(),
      (e || i) && t.translate(-e, -i),
      this.children.map((t) => t.render && t.render()),
      t.restore();
  }
  draw() {}
  _pc() {
    this._uw(), this.children.map((t) => t._pc());
  }
  get x() {
    return this.position.x;
  }
  get y() {
    return this.position.y;
  }
  set x(t) {
    (this.position.x = t), this._pc();
  }
  set y(t) {
    (this.position.y = t), this._pc();
  }
  get width() {
    return this._w;
  }
  set width(t) {
    (this._w = t), this._pc();
  }
  get height() {
    return this._h;
  }
  set height(t) {
    (this._h = t), this._pc();
  }
  _uw() {
    if (!this._di) return;
    let {
      _wx: t = 0,
      _wy: e = 0,
      _wo: i = 1,
      _wr: s = 0,
      _wsx: a = 1,
      _wsy: n = 1,
    } = this.parent || {};
    (this._wx = this.x),
      (this._wy = this.y),
      (this._ww = this.width),
      (this._wh = this.height),
      (this._wo = i * this.opacity),
      (this._wsx = a * this.scaleX),
      (this._wsy = n * this.scaleY),
      (this._wx = this._wx * a),
      (this._wy = this._wy * n),
      (this._ww = this.width * this._wsx),
      (this._wh = this.height * this._wsy),
      (this._wr = s + this.rotation);
    let { x: r, y: o } = rotatePoint({ x: this._wx, y: this._wy }, s);
    (this._wx = r), (this._wy = o), (this._wx += t), (this._wy += e);
  }
  get world() {
    return {
      x: this._wx,
      y: this._wy,
      width: this._ww,
      height: this._wh,
      opacity: this._wo,
      rotation: this._wr,
      scaleX: this._wsx,
      scaleY: this._wsy,
    };
  }
  set children(t) {
    this.removeChild(this._c), this.addChild(t);
  }
  get children() {
    return this._c;
  }
  addChild(...t) {
    t.flat().map((t) => {
      this.children.push(t),
        (t.parent = this),
        (t._pc = t._pc || noop),
        t._pc();
    });
  }
  removeChild(...t) {
    t.flat().map((t) => {
      removeFromArray(this.children, t) && ((t.parent = null), t._pc());
    });
  }
  get opacity() {
    return this._opa;
  }
  set opacity(t) {
    (this._opa = t), this._pc();
  }
  get rotation() {
    return this._rot;
  }
  set rotation(t) {
    (this._rot = t), this._pc();
  }
  setScale(t, e = t) {
    (this.scaleX = t), (this.scaleY = e);
  }
  get scaleX() {
    return this._scx;
  }
  set scaleX(t) {
    (this._scx = t), this._pc();
  }
  get scaleY() {
    return this._scy;
  }
  set scaleY(t) {
    (this._scy = t), this._pc();
  }
}
function factory$9() {
  return new GameObject(...arguments);
}
class Sprite extends GameObject {
  init({
    image: t,
    width: e = t ? t.width : void 0,
    height: i = t ? t.height : void 0,
    ...s
  } = {}) {
    super.init({ image: t, width: e, height: i, ...s });
  }
  get animations() {
    return this._a;
  }
  set animations(t) {
    let e, i;
    for (e in ((this._a = {}), t))
      (this._a[e] = t[e].clone()), (i = i || this._a[e]);
    (this.currentAnimation = i),
      (this.width = this.width || i.width),
      (this.height = this.height || i.height);
  }
  playAnimation(t) {
    (this.currentAnimation = this.animations[t]),
      this.currentAnimation.loop || this.currentAnimation.reset();
  }
  advance(t) {
    super.advance(t), this.currentAnimation && this.currentAnimation.update(t);
  }
  draw() {
    this.image &&
      this.context.drawImage(
        this.image,
        0,
        0,
        this.image.width,
        this.image.height
      ),
      this.currentAnimation &&
        this.currentAnimation.render({
          x: 0,
          y: 0,
          width: this.width,
          height: this.height,
          context: this.context,
        }),
      this.color &&
        ((this.context.fillStyle = this.color),
        this.context.fillRect(0, 0, this.width, this.height));
  }
}
function factory$8() {
  return new Sprite(...arguments);
}
let fontSizeRegex = /(\d+)(\w+)/;
function parseFont(t) {
  let e = t.match(fontSizeRegex),
    i = +e[1];
  return { size: i, unit: e[2], computed: i };
}

let pointers = new WeakMap();
function getPointer(t = getCanvas()) {
  return pointers.get(t);
}
function initPointer() {}
function track(...t) {
  t.flat().map((t) => {
    let e = t.context ? t.context.canvas : getCanvas(),
      i = pointers.get(e);
    if (!i)
      throw new ReferenceError(
        'Pointer events not initialized for the objects canvas'
      );
    t._r ||
      ((t._r = t.render),
      (t.render = function () {
        i._cf.push(this), this._r();
      }),
      i._o.push(t));
  });
}
function untrack(...t) {
  t.flat().map((t) => {
    let e = t.context ? t.context.canvas : getCanvas(),
      i = pointers.get(e);
    if (!i)
      throw new ReferenceError(
        'Pointer events not initialized for the objects canvas'
      );
    (t.render = t._r), (t._r = 0), removeFromArray(i._o, t);
  });
}
function onPointer() {}
function offPointer() {}
function clear(t) {
  let e = t.canvas;
  t.clearRect(0, 0, e.width, e.height);
}
function GameLoop({
  fps: t = 60,
  clearCanvas: e = !0,
  update: i = noop,
  render: s,
  context: a = getContext(),
  blur: n = !1,
} = {}) {
  if (!s) throw Error('You must provide a render() function');
  let r,
    o,
    h,
    d,
    l,
    c = 0,
    u = 1e3 / t,
    p = 1 / t,
    g = e ? clear : noop,
    f = !0;
  function m() {
    if (
      ((o = requestAnimationFrame(m)),
      f && ((h = performance.now()), (d = h - r), (r = h), !(d > 1e3)))
    ) {
      for (emit('tick'), c += d; c >= u; ) l.update(p), (c -= u);
      g(a), l.render();
    }
  }
  return (
    n ||
      (window.addEventListener('focus', () => {
        f = !0;
      }),
      window.addEventListener('blur', () => {
        f = !1;
      })),
    (l = {
      update: i,
      render: s,
      isStopped: !0,
      start() {
        (r = performance.now()),
          (this.isStopped = !1),
          requestAnimationFrame(m);
      },
      stop() {
        (this.isStopped = !0), cancelAnimationFrame(o);
      },
      _frame: m,
      set _last(t) {
        r = t;
      },
    }),
    l
  );
}

function initGamepad() {}
function initGesture() {}
let keydownCallbacks = {},
  keyupCallbacks = {},
  pressedKeys = {},
  keyMap = {
    Enter: 'enter',
    Escape: 'esc',
    Space: 'space',
    ArrowLeft: 'arrowleft',
    ArrowUp: 'arrowup',
    ArrowRight: 'arrowright',
    ArrowDown: 'arrowdown',
  };
function call(t = noop, e) {
  t._pd && e.preventDefault(), t(e);
}
function keydownEventHandler(t) {
  let e = keyMap[t.code],
    i = keydownCallbacks[e];
  (pressedKeys[e] = !0), call(i, t);
}
function keyupEventHandler(t) {
  let e = keyMap[t.code],
    i = keyupCallbacks[e];
  (pressedKeys[e] = !1), call(i, t);
}
function blurEventHandler() {
  pressedKeys = {};
}
function initKeys() {
  let t;
  for (t = 0; t < 26; t++)
    keyMap['Key' + String.fromCharCode(t + 65)] = String.fromCharCode(t + 97);
  for (t = 0; t < 10; t++) keyMap['Digit' + t] = keyMap['Numpad' + t] = '' + t;
  window.addEventListener('keydown', keydownEventHandler),
    window.addEventListener('keyup', keyupEventHandler),
    window.addEventListener('blur', blurEventHandler);
}
function onKey(t, e, { handler: i = 'keydown', preventDefault: s = !0 } = {}) {
  let a = 'keydown' == i ? keydownCallbacks : keyupCallbacks;
  (e._pd = s), [].concat(t).map((t) => (a[t] = e));
}
function offKey(t, { handler: e = 'keydown' } = {}) {
  let i = 'keydown' == e ? keydownCallbacks : keyupCallbacks;
  [].concat(t).map((t) => delete i[t]);
}
function keyPressed(t) {
  return !!pressedKeys[t];
}
function contains(t, e) {
  return Object.values(e).includes(t);
}
function initInput(t = {}) {
  initKeys();
  let e = initPointer();
  return initGesture(), initGamepad(), { pointer: e };
}
function onInput(t, e, { gamepad: i, key: s } = {}) {
  [].concat(t).map((t) => {
    if (contains(t, keyMap)) onKey(t, e, s);
    else {
      if (!['down', 'up'].includes(t))
        throw new TypeError(`"${t}" is not a valid input name`);
      onPointer(t, e);
    }
  });
}
function offInput(t, { gamepad: e, key: i } = {}) {
  [].concat(t).map((t) => {
    contains(t, keyMap)
      ? offKey(t, i)
      : ['down', 'up'].includes(t) && offPointer(t);
  });
}
function getMethod(t) {
  let e = t.substr(t.search(/[A-Z]/));
  return e[0].toLowerCase() + e.substr(1);
}
function registerPlugin(t, e) {
  let i = t.prototype;
  i &&
    (i._inc ||
      ((i._inc = {}),
      (i._bInc = function (t, e, ...i) {
        return this._inc[e].before.reduce((e, i) => {
          let s = i(t, ...e);
          return s || e;
        }, i);
      }),
      (i._aInc = function (t, e, i, ...s) {
        return this._inc[e].after.reduce((e, i) => {
          let a = i(t, e, ...s);
          return a || e;
        }, i);
      })),
    Object.getOwnPropertyNames(e).map((t) => {
      let s = getMethod(t);
      i[s] &&
        (i['_o' + s] ||
          ((i['_o' + s] = i[s]),
          (i[s] = function (...t) {
            let e = this._bInc(this, s, ...t),
              a = i['_o' + s].call(this, ...e);
            return this._aInc(this, s, a, ...t);
          })),
        i._inc[s] || (i._inc[s] = { before: [], after: [] }),
        t.startsWith('before')
          ? i._inc[s].before.push(e[t])
          : t.startsWith('after') && i._inc[s].after.push(e[t]));
    }));
}
function unregisterPlugin(t, e) {
  let i = t.prototype;
  i &&
    i._inc &&
    Object.getOwnPropertyNames(e).map((t) => {
      let s = getMethod(t);
      t.startsWith('before')
        ? removeFromArray(i._inc[s].before, e[t])
        : t.startsWith('after') && removeFromArray(i._inc[s].after, e[t]);
    });
}
function extendObject(t, e) {
  let i = t.prototype;
  i &&
    Object.getOwnPropertyNames(e).map((t) => {
      i[t] || (i[t] = e[t]);
    });
}
class Pool {
  constructor({ create: t, maxSize: e = 1024 } = {}) {
    let i;
    if (!t || !(i = t()) || !(i.update && i.init && i.isAlive && i.render))
      throw Error(
        'Must provide create() function which returns an object with init(), update(), render(), and isAlive() functions'
      );
    (this._c = t), (this.objects = [t()]), (this.size = 0), (this.maxSize = e);
  }
  get(t = {}) {
    if (this.size == this.objects.length) {
      if (this.size == this.maxSize) return;
      for (let t = 0; t < this.size && this.objects.length < this.maxSize; t++)
        this.objects.push(this._c());
    }
    let e = this.objects[this.size];
    return this.size++, e.init(t), e;
  }
  getAliveObjects() {
    return this.objects.slice(0, this.size);
  }
  clear() {
    (this.size = this.objects.length = 0), this.objects.push(this._c());
  }
  update(t) {
    let e,
      i = !1;
    for (let s = this.size; s--; )
      (e = this.objects[s]),
        e.update(t),
        e.isAlive() || ((i = !0), this.size--);
    i && this.objects.sort((t, e) => e.isAlive() - t.isAlive());
  }
  render() {
    for (let t = this.size; t--; ) this.objects[t].render();
  }
}
function factory$4() {
  return new Pool(...arguments);
}
function getIndices(t, e) {
  let i = [],
    s = e.x + e.width / 2,
    a = e.y + e.height / 2,
    n = t.y < a,
    r = t.y + t.height >= a;
  return (
    t.x < s && (n && i.push(0), r && i.push(2)),
    t.x + t.width >= s && (n && i.push(1), r && i.push(3)),
    i
  );
}
class Quadtree {
  constructor({ maxDepth: t = 3, maxObjects: e = 25, bounds: i } = {}) {
    (this.maxDepth = t), (this.maxObjects = e);
    let s = getCanvas();
    (this.bounds = i || { x: 0, y: 0, width: s.width, height: s.height }),
      (this._b = !1),
      (this._d = 0),
      (this._o = []),
      (this._s = []),
      (this._p = null);
  }
  clear() {
    this._s.map((t) => {
      t.clear();
    }),
      (this._b = !1),
      (this._o.length = 0);
  }
  get(t) {
    let e = new Set();
    for (; this._s.length && this._b; )
      return (
        getIndices(t, this.bounds).map((i) => {
          this._s[i].get(t).map((t) => e.add(t));
        }),
        Array.from(e)
      );
    return this._o.filter((e) => e !== t);
  }
  add(...t) {
    t.flat().map((t) => {
      this._b
        ? this._a(t)
        : (this._o.push(t),
          this._o.length > this.maxObjects &&
            this._d < this.maxDepth &&
            (this._sp(), this._o.map((t) => this._a(t)), (this._o.length = 0)));
    });
  }
  _a(t) {
    getIndices(t, this.bounds).map((e) => {
      this._s[e].add(t);
    });
  }
  _sp(t, e, i) {
    if (((this._b = !0), !this._s.length))
      for (
        t = (this.bounds.width / 2) | 0,
          e = (this.bounds.height / 2) | 0,
          i = 0;
        i < 4;
        i++
      )
        (this._s[i] = new Quadtree({
          bounds: {
            x: this.bounds.x + (i % 2 == 1 ? t : 0),
            y: this.bounds.y + (i >= 2 ? e : 0),
            width: t,
            height: e,
          },
          maxDepth: this.maxDepth,
          maxObjects: this.maxObjects,
        })),
          (this._s[i]._d = this._d + 1);
  }
}
function factory$3() {
  return new Quadtree(...arguments);
}
function getAllNodes(t) {
  let e = [];
  return (
    t._dn
      ? e.push(t._dn)
      : t.children &&
        t.children.map((t) => {
          e = e.concat(getAllNodes(t));
        }),
    e
  );
}
class Scene {
  constructor({
    id: t,
    name: e = t,
    objects: i = [],
    context: s = getContext(),
    cullObjects: a = !0,
    cullFunction: n = collides,
    sortFunction: r,
    ...o
  }) {
    this._o = [];
    let h = s.canvas,
      d = (this._dn = document.createElement('section'));
    (d.tabIndex = -1),
      (d.style = srOnlyStyle),
      (d.id = t),
      d.setAttribute('aria-label', e),
      addToDom(d, h),
      Object.assign(this, {
        id: t,
        name: e,
        context: s,
        cullObjects: a,
        cullFunction: n,
        sortFunction: r,
        ...o,
      });
    let { width: l, height: c } = h,
      u = l / 2,
      p = c / 2;
    (this.camera = factory$9({
      x: u,
      y: p,
      width: l,
      height: c,
      context: s,
      centerX: u,
      centerY: p,
      anchor: { x: 0.5, y: 0.5 },
      render: this._rf.bind(this),
    })),
      this.add(i);
  }
  set objects(t) {
    this.remove(this._o), this.add(t);
  }
  get objects() {
    return this._o;
  }
  add(...t) {
    t.flat().map((t) => {
      this._o.push(t),
        getAllNodes(t).map((t) => {
          this._dn.appendChild(t);
        });
    });
  }
  remove(...t) {
    t.flat().map((t) => {
      removeFromArray(this._o, t),
        getAllNodes(t).map((t) => {
          addToDom(t, this.context);
        });
    });
  }
  show() {
    this.hidden = this._dn.hidden = !1;
    let t = this._o.find((t) => t.focus);
    t ? t.focus() : this._dn.focus(), this.onShow();
  }
  hide() {
    (this.hidden = this._dn.hidden = !0), this.onHide();
  }
  destroy() {
    this._dn.remove(), this._o.map((t) => t.destroy && t.destroy());
  }
  lookAt(t) {
    let { x: e, y: i } = t.world || t;
    (this.camera.x = e), (this.camera.y = i);
  }
  update(t) {
    this.hidden || this._o.map((e) => e.update && e.update(t));
  }
  _rf() {
    let {
      _o: t,
      context: e,
      _sx: i,
      _sy: s,
      camera: a,
      sortFunction: n,
      cullObjects: r,
      cullFunction: o,
    } = this;
    e.translate(i, s);
    let h = t;
    r && (h = h.filter((t) => o(a, t))),
      n && h.sort(n),
      h.map((t) => t.render && t.render());
  }
  render() {
    if (!this.hidden) {
      let { context: t, camera: e } = this,
        { x: i, y: s, centerX: a, centerY: n } = e;
      t.save(),
        (this._sx = a - i),
        (this._sy = n - s),
        t.translate(this._sx, this._sy),
        e.render(),
        t.restore();
    }
  }
  onShow() {}
  onHide() {}
}
function factory$2() {
  return new Scene(...arguments);
}
function parseFrames(t) {
  if (+t == t) return t;
  let e = [],
    i = t.split('..'),
    s = +i[0],
    a = +i[1],
    n = s;
  if (s < a) for (; n <= a; n++) e.push(n);
  else for (; n >= a; n--) e.push(n);
  return e;
}
class SpriteSheet {
  constructor({
    image: t,
    frameWidth: e,
    frameHeight: i,
    frameMargin: s,
    animations: a,
  } = {}) {
    if (!t) throw Error('You must provide an Image for the SpriteSheet');
    (this.animations = {}),
      (this.image = t),
      (this.frame = { width: e, height: i, margin: s }),
      (this._f = (t.width / e) | 0),
      this.createAnimations(a);
  }
  createAnimations(t) {
    let e, i;
    for (i in t) {
      let { frames: s, frameRate: a, loop: n } = t[i];
      if (((e = []), null == s))
        throw Error('Animation ' + i + ' must provide a frames property');
      [].concat(s).map((t) => {
        e = e.concat(parseFrames(t));
      }),
        (this.animations[i] = factory$b({
          spriteSheet: this,
          frames: e,
          frameRate: a,
          loop: n,
        }));
    }
  }
}
function factory$1() {
  return new SpriteSheet(...arguments);
}
function getRow(t, e) {
  return (t / e) | 0;
}
function getCol(t, e) {
  return (t / e) | 0;
}
class TileEngine {
  constructor(t = {}) {
    let { width: e, height: i, tilewidth: s, tileheight: a, tilesets: n } = t,
      r = e * s,
      o = i * a,
      h = document.createElement('canvas');
    (h.width = r),
      (h.height = o),
      (this._c = h),
      (this._ctx = h.getContext('2d')),
      n.map((e) => {
        let { __k: i, location: s } = window,
          a = (i ? i.dm.get(t) : '') || s.href,
          { source: n } = e;
        if (n) {
          if (!i)
            throw Error(
              'You must use "load" or "loadData" to resolve tileset.source'
            );
          let t = i.d[i.u(n, a)];
          if (!t)
            throw Error(
              `You must load the tileset source "${n}" before loading the tileset`
            );
          Object.keys(t).map((i) => {
            e[i] = t[i];
          });
        }
        let { image: r } = e;
        if ('' + r === r) {
          if (!i)
            throw Error(
              'You must use "load" or "loadImage" to resolve tileset.image'
            );
          let t = i.i[i.u(r, a)];
          if (!t)
            throw Error(
              `You must load the image "${r}" before loading the tileset`
            );
          e.image = t;
        }
      }),
      Object.assign(this, {
        context: getContext(),
        layerMap: {},
        layerCanvases: {},
        mapwidth: r,
        mapheight: o,
        _sx: 0,
        _sy: 0,
        _o: [],
        ...t,
      }),
      this._p();
  }
  get sx() {
    return this._sx;
  }
  get sy() {
    return this._sy;
  }
  set sx(t) {
    this._sx = clamp(0, this.mapwidth - getCanvas().width, t);
  }
  set sy(t) {
    this._sy = clamp(0, this.mapheight - getCanvas().height, t);
  }
  set objects(t) {
    this.remove(this._o), this.add(t);
  }
  get objects() {
    return this._o;
  }
  add(...t) {
    t.flat().map((t) => {
      this._o.push(t);
    });
  }
  remove(...t) {
    t.flat().map((t) => {
      removeFromArray(this._o, t);
    });
  }
  setTileAtLayer(t, e, i) {
    let { layerMap: s, tileheight: a, tilewidth: n, width: r } = this,
      { row: o, col: h, x: d, y: l } = e,
      c = o ?? getRow(l, a),
      u = h ?? getCol(d, n);
    s[t] && ((this._d = !0), (s[t]._d = !0), (s[t].data[c * r + u] = i));
  }
  setLayer(t, e) {
    let { layerMap: i } = this;
    i[t] && ((this._d = !0), (i[t]._d = !0), (i[t].data = e));
  }
  layerCollidesWith(t, e) {
    let { tilewidth: i, tileheight: s, layerMap: a } = this,
      { x: n, y: r, width: o, height: h } = getWorldRect(e),
      d = getRow(r, s),
      l = getCol(n, i),
      c = getRow(r + h, s),
      u = getCol(n + o, i),
      p = a[t];
    for (let t = d; t <= c; t++)
      for (let e = l; e <= u; e++) if (p.data[e + t * this.width]) return !0;
    return !1;
  }
  tileAtLayer(t, e) {
    let { layerMap: i, tileheight: s, tilewidth: a, width: n } = this,
      { row: r, col: o, x: h, y: d } = e,
      l = r ?? getRow(d, s),
      c = o ?? getCol(h, a);
    return i[t] ? i[t].data[l * n + c] : -1;
  }
  render(t = this._c, e = !0) {
    let { _d: i, context: s, sx: a = 0, sy: n = 0 } = this;
    i && this._p();
    let { width: r, height: o } = getCanvas(),
      h = Math.min(t.width, r),
      d = Math.min(t.height, o);
    s.drawImage(t, a, n, h, d, 0, 0, h, d),
      e &&
        (s.save(),
        (a || n) && s.translate(-a, -n),
        this.objects.map((t) => t.render && t.render()),
        s.restore());
  }
  renderLayer(t) {
    let { layerCanvases: e, layerMap: i } = this,
      s = i[t],
      a = e[t],
      n = a?.getContext('2d');
    if (!a) {
      let { mapwidth: i, mapheight: r } = this;
      (a = document.createElement('canvas')),
        (n = a.getContext('2d')),
        (a.width = i),
        (a.height = r),
        (e[t] = a),
        this._r(s, n);
    }
    s._d && ((s._d = !1), n.clearRect(0, 0, a.width, a.height), this._r(s, n)),
      this.render(a, !1);
  }
  _p() {
    let { _ctx: t, layers: e = [], layerMap: i } = this;
    (this._d = !1),
      e.map((e) => {
        let { name: s, data: a, visible: n } = e;
        (e._d = !1), (i[s] = e), a && 0 != n && this._r(e, t);
      });
  }
  _r(t, e) {
    let { opacity: i, data: s = [] } = t,
      { tilesets: a, width: n, tilewidth: r, tileheight: o } = this;
    e.save(),
      (e.globalAlpha = i),
      s.map((t, i) => {
        if (!t) return;
        let s;
        for (
          let e = a.length - 1;
          e >= 0 && ((s = a[e]), !(t / s.firstgid >= 1));
          e--
        );
        let { image: h, margin: d = 0, firstgid: l, columns: c } = s,
          u = t - l,
          p = c ?? (h.width / (r + d)) | 0,
          g = (i % n) * r,
          f = ((i / n) | 0) * o,
          m = (u % p) * (r + d),
          _ = ((u / p) | 0) * (o + d);
        e.drawImage(h, m, _, r, o, g, f, r, o);
      }),
      e.restore();
  }
}
function factory() {
  return new TileEngine(...arguments);
}
let kontra = {
  Animation: factory$b,
  AnimationClass: Animation,
  imageAssets: imageAssets,
  audioAssets: audioAssets,
  dataAssets: dataAssets,
  setImagePath: setImagePath,
  setAudioPath: setAudioPath,
  setDataPath: setDataPath,
  loadImage: loadImage,
  loadAudio: loadAudio,
  loadData: loadData,
  load: load,
  init: init$1,
  getCanvas: getCanvas,
  getContext: getContext,
  on: on,
  off: off,
  emit: emit,
  GameLoop: GameLoop,
  GameObject: factory$9,
  GameObjectClass: GameObject,
  initGamepad: initGamepad,
  initGesture: initGesture,
  degToRad: degToRad,
  radToDeg: radToDeg,
  angleToTarget: angleToTarget,
  rotatePoint: rotatePoint,
  movePoint: movePoint,
  randInt: randInt,
  seedRand: seedRand,
  lerp: lerp,
  inverseLerp: inverseLerp,
  clamp: clamp,
  setStoreItem: setStoreItem,
  getStoreItem: getStoreItem,
  collides: collides,
  getWorldRect: getWorldRect,
  depthSort: depthSort,
  initInput: initInput,
  onInput: onInput,
  offInput: offInput,
  keyMap: keyMap,
  initKeys: initKeys,
  onKey: onKey,
  offKey: offKey,
  keyPressed: keyPressed,
  registerPlugin: registerPlugin,
  unregisterPlugin: unregisterPlugin,
  extendObject: extendObject,
  getPointer: getPointer,
  track: track,
  untrack: untrack,
  onPointer: onPointer,
  offPointer: offPointer,
  Pool: factory$4,
  PoolClass: Pool,
  Quadtree: factory$3,
  QuadtreeClass: Quadtree,
  Scene: factory$2,
  SceneClass: Scene,
  Sprite: factory$8,
  SpriteClass: Sprite,
  SpriteSheet: factory$1,
  SpriteSheetClass: SpriteSheet,
  TileEngine: factory,
  Vector: factory$a,
  VectorClass: Vector,
};
export {
  factory$b as Animation,
  Animation as AnimationClass,
  GameLoop,
  factory$9 as GameObject,
  GameObject as GameObjectClass,
  factory$4 as Pool,
  Pool as PoolClass,
  factory$3 as Quadtree,
  Quadtree as QuadtreeClass,
  factory$2 as Scene,
  Scene as SceneClass,
  factory$8 as Sprite,
  Sprite as SpriteClass,
  factory$1 as SpriteSheet,
  SpriteSheet as SpriteSheetClass,
  factory as TileEngine,
  factory$a as Vector,
  Vector as VectorClass,
  angleToTarget,
  audioAssets,
  clamp,
  collides,
  dataAssets,
  kontra as default,
  degToRad,
  depthSort,
  emit,
  extendObject,
  getCanvas,
  getContext,
  getPointer,
  getStoreItem,
  getWorldRect,
  imageAssets,
  init$1 as init,
  initGamepad,
  initGesture,
  initInput,
  initKeys,
  inverseLerp,
  keyMap,
  keyPressed,
  lerp,
  load,
  loadAudio,
  loadData,
  loadImage,
  movePoint,
  off,
  offInput,
  offKey,
  offPointer,
  on,
  onInput,
  onKey,
  onPointer,
  radToDeg,
  randInt,
  registerPlugin,
  rotatePoint,
  seedRand,
  setAudioPath,
  setDataPath,
  setImagePath,
  setStoreItem,
  track,
  unregisterPlugin,
  untrack,
};
