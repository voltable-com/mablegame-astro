/** API folder, resolved from this script's own URL (`<base>/js/game.js`) */
const API_BASE = new URL("../api/", document.currentScript.src).href;

/**
 * Generate a random integer between `min` and `max` (inclusive)
 * 
 * @param {*} min
 * @param {*} max
 * @returns Random integer between `min` and `max` (inclusive)
 */
function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Set the value of a board cell and flag the digits entered by the player
 * 
 * @param {HTMLElement} cell - Board cell
 * @param {string} value - Digit or 'x'
 */
const set_cell = function (cell, value) {
  cell.innerText = value;
  cell.classList.toggle('g', value !== 'x' && !cell.classList.contains('w'));
};

/**
 * Create an input element to enter a
 * numeric input with only one digit
 * 
 * @param {HTMLElement} cell - Board cell that will hold the input
 * @param {*} value - Initial value of the input element
 * @param {Function} onchange - Called after the cell value is committed
 * @returns 
 */
const create_input = function(cell, value, onchange) {
  const oldvalue = value;
  const input = document.createElement('input');
  input.type = 'number';
  input.inputMode = 'numeric';
  input.pattern = '[0-9]*';
  input.maxLength = 1;
  input.size = 1;
  input.className = 'input no-spin';
  input.setAttribute('aria-label', 'Digit');
  if (value !== 'x') {
    input.value = value;
  }
  // Replacing the cell content removes the input, which may fire `blur` synchronously
  let done = false;
  const commit = function (v) {
    if (done) {
      return;
    }
    done = true;
    set_cell(cell, v);
    onchange();
  };
  input.addEventListener('keydown', e => {
    if (/^[0-9]$/.test(e.key)) {
      commit(e.key);
    } else if (e.key === 'Delete' || e.key === 'Backspace' || e.key === 'Process') {
      commit('x');
    } else if (e.key !== 'Unidentified') {
      commit(oldvalue);
    }
  });
  // Virtual keyboards report key 'Unidentified', the digit arrives through `input`
  input.addEventListener('input', () => {
    const digit = input.value.replace(/\D/g, '').slice(-1);
    commit(digit === '' ? 'x' : digit);
  });
  input.addEventListener('blur', () => commit(oldvalue));

  return input;
};

/**
 * Class to manage swith between light and dark theme
 * 
 * The initial theme is applied by an inline script in the page head,
 * so this component only mirrors and updates it.
 */
const toggletheme = () => ({
  dark: false,
  init: function () {
    this.dark = document.documentElement.classList.contains('theme-dark');
  },
  switchTheme: function () {
    this.dark = !this.dark;
    const theme = this.dark ? 'theme-dark' : 'theme-light';
    document.documentElement.className = theme;
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {}
  }
});

/**
 * Class to manage the game Mable throught alpine.js
 * 
 * We need to discover the numbers `n1` and `n2` that are hidden in the game.
 * The game show us the result of the multiplication of `n1` and `n2`
 * 
 * Some partial result of the multiplication are also shown stored in `f` variable
 */
const mable = () => ({
  /**
   * Number `n1` to discover
   */
  n1: '',
  /**
   * Number `n2` to discover
   */
  n2: '',
  /**
   * Partial result of the multiplication. hints
   */
  f: '',
  x1: [],
  x2: [],
  cells: [],
  c: 0,
  solution: '',
  ended: false,
  wrong: false,
  /**
   * Board is drawn and ready to play
   */
  ready: false,
  /**
   * Number of hidden digits on the board and how many are still hidden
   */
  total: 0,
  left: 0,
  get found() {
    return this.total - this.left;
  },
  get progress() {
    return this.total ? Math.round(this.found / this.total * 100) : 0;
  },
  /**
   * Initialize the game
   * Retriere the numbers from the API and draw the game
   */
  init: function () {
    this.ended = false;
    this.wrong = false;
    this.c = 0;
    // Get random multiplication numbers and draw the game
    document.addEventListener('alpine:initialized', () => {
      let id = rnd(1, 12400);
      this.getData(id);
    });
  },
  /**
   * Get the data from the API
   * The API return a base64 encoded string of an json object
   * Keep the data in the variables `n1`, `n2` and `f`
   * 
   * @param {*} id
   * @returns void
   */ 
  getData: function (id) {
    let apiUrl = API_BASE + id + ".json";
    fetch(apiUrl).then(r => r.json()).then(r => {
      this.setData(r);
      this.draw(this.x1, 1);
      this.draw(this.x2, 11);
      this.total = this.countHidden();
      this.left = this.total;
      this.ready = true;
    });
  },
  /**
   * Set the data from the API
   * 
   * @param {*} r
   * @returns void
   */
  setData: function (r) {
    let data = JSON.parse(atob(r));
    this.n1 = atob(data.n1);
    this.n2 = atob(data.n2);
    this.f = atob(data.f).split('');
    this.x1 = Array.from(this.getx1(this.n1, this.n2));
    this.x2 = Array.from(this.getx1(this.n2, this.n1));
    this.cells = Array.from(document.querySelectorAll('#b div'));
  },
  /**
   * Count the cells that still hold an 'x'
   * 
   * @returns number
   */
  countHidden: function () {
    return this.cells.reduce((t, x) => x.innerText === 'x' ? t + 1 : t, 0);
  },
  /**
   * Check if the game is ended
   * 
   * @returns void
   */
  checkState: function () {
    this.left = this.countHidden();
    if (this.left === 0) {
      let founded = this.multiplicationFounded();
      this.solution = this.x1[0][0] + ' &times; ' + this.x1[1][0];
      this.ended = founded;
      this.wrong = !founded;
      this.$nextTick(() => {
        const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.$refs.result.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' });
      });
    } else {
      this.ended = false;
      this.wrong = false;
    }
  },
  getp: function (x1) {
    return x1.reduce((t, x) => t + (String(x[0]) == '0' ? '' : String(x[0])), '');
  },
  multiplicationFounded: function () {
    let solution = this.cells.reduce((t, x) => t + x.innerText, 0);
    let s1 = this.getp(this.x1);
    let s2 = this.getp(this.x2);
    return '0' + s1 + s2 == solution;
  },
  aclick: function (e) {
    if (e.target.dataset.c && e.target.dataset.c >= 0) {
      if (e.ctrlKey) {
        set_cell(e.target, this.f[e.target.dataset.c]);
        this.checkState();
      } else if (!e.target.classList.contains('w')) {
        let cell = e.target;
        let value = cell.innerText;
        cell.innerText = '';
        let input = create_input(cell, value, () => this.checkState());
        cell.append(input);
        input.focus();
      }
    }
  },
  getx1: function* (n1, n2) {
    yield [n1, 0];
    yield [n2, 0];
    for (let n = n2.length, i = n - 1; i >= 0; i--) {
      yield [String(n2[i] * n1), n - i - 1];
    };
    yield [String(n1 * n2), 0];
  },
  draw: function (x, pos) {
    x = Array.from(x);
    let p = 0;
    for (let i = 0; i < x.length; i++) {
      let v = x[i][0];
      let vp = x[i][1];
      if (v === '0') {
        this.c = this.c + 1;
        continue;
      }
      this.drawNumber(v, vp, pos, p);
      p = p + 1;
    }
    this.drawSign(x[1][0], pos);
    this.drawLine(3, pos);
    this.drawLine(p, pos);
  },
  /**
   * Mark the cell left of the second factor to show the multiplication sign
   * 
   * @param {string} v - Second factor
   * @param {number} pos - Board row where the multiplication starts
   */
  drawSign: function (v, pos) {
    let cpos = (1 + pos) * 9 + 1 + pos % 10 + (10 - v.length) - 1;
    this.cells[cpos].classList.add('op');
  },
  drawNumber: function (v, vp, pos, p) {
    for (let j = 0, n = v.length; j < n; j++) {
      let cpos = (p + pos) * 9 + p + pos % 10 + (10 - n) - vp + j;
      let val = this.f[this.c];
      this.cells[cpos].innerText = val;
      this.cells[cpos].dataset.c = this.c;
      if (val != 'x') {
        this.cells[cpos].classList.add('w');
      }
      this.c = this.c + 1;
    }
  },
  drawLine: function (p, pos) {
    for (let i = 0; i < 10; i++) {
      let cpos = (p - 2 + pos) * 9 + p + 7 + pos % 10 - i;
      this.cells[cpos].classList.add('bb');
    }
  },
});
