/**
 * Generate an array of integers from `start` to `end` (inclusive)
 * 
 * @param {*} start 
 * @param {*} end 
 * @returns Array of integers from `start` to `end` (inclusive)
 */
const range = (start, end) => e > s ? [s, ...range(s + 1, e)] : [s];

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
 * Create an input element to enter a
 * numeric input with only one digit
 * 
 * @param {*} value - Initial value of the input element
 * @returns 
 */
const create_input = function(value) {
  const oldvalue = value;
  const  input =  document.createElement('input');
  input.type = 'number';
  input.inputMode = 'numeric';
  input.pattern = '[0-9]*';
  input.maxLength = 1;
  input.size = 1;
  input.className = 'input no-spin';
  if (value !== 'x') {
    input.value = value;
  }
  input.addEventListener('keydown', e => {
    if (isFinite(e.key)) {
      e.target.parentNode.innerText = e.key;
    } else if (e.key === 'Delete' || e.key === 'Backspace' || e.key === 'Process') {
      e.target.parentNode.innerText = 'x';
    } else {
      e.target.parentNode.innerText = oldvalue;
    }
    e.target.remove();
  });
  input.addEventListener('blur', e => {
    e.target.parentNode.innerText = oldvalue;
    e.target.remove();
  });  

  return input;
};

/**
 * Class to manage swith between light and dark theme
 */
const toggletheme = () => ({
  init: function () {
    const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

    if (currentTheme) {
      document.documentElement.className = currentTheme;

      if (currentTheme === 'theme-dark') {
        this.$refs.toggleTheme.checked = true;
      }
    }
  },
  switchTheme: function (e) {
    if (e.target.checked) {
      document.documentElement.className = 'theme-dark';
      localStorage.setItem('theme', 'theme-dark');
    }
    else {
      document.documentElement.className = 'theme-light';
      localStorage.setItem('theme', 'theme-light');
    }
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
    let apiUrl = "/api/" + id + ".json";
    fetch(apiUrl).then(r => r.json()).then(r => {
      this.setData(r);
      this.draw(this.x1, 1);
      this.draw(this.x2, 11);
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
   * Check if the game is ended
   * 
   * @returns void
   */
  checkState: function () {
    let cnt = this.cells.reduce((t, x) => x.innerText === 'x' ? t + 1 : t, 0);
    if (cnt === 0) {
      let founded = this.multiplicationFounded();
      this.solution = this.x1[0][0] + ' &times; ' + this.x1[1][0];
      this.ended = founded;
      this.wrong = !founded;
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
        e.target.innerText = this.f[e.target.dataset.c];
        this.checkState();
      } else if (!e.target.classList.contains('w')) {
        let value = e.target.innerText;
        e.target.innerText = '';
        let input = create_input(value);
        e.target.append(input);
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
    this.drawLine(p, pos);
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
