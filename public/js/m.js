const range = (s, e) => e > s ? [s, ...range(s + 1, e)] : [s];

function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const toggletheme = () => ({
  init: function() {
    const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

    if (currentTheme) {
        document.documentElement.className = currentTheme;

        if (currentTheme === 'theme-dark') {
            this.$refs.toggleTheme.checked = true;
        }
    }
  },
  switchTheme: function(e) {
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

const mable = () => ({
  n1: '',
  n2: '',
  f: '',
  x1: [],
  x2: [],
  cells: [],
  c:0,
  solution: '',
  ended: false,
  wrong: false,
  init: function() {
    this.ended = false;
    this.wrong = false;
    this.c = 0;
    document.addEventListener('alpine:initialized', () => {
      let id = rnd(1,12400);
      let apiUrl = "/api/"+id+".json";
      fetch(apiUrl).then(r => r.json()).then(r => {
        this.setData(r);
        this.draw(this.x1, 1);
        this.draw(this.x2, 11);
      });
    });
  },
  setData: function(r) {
    let data = JSON.parse(atob(r.data));
    this.n1 = atob(data.n1);
    this.n2 = atob(data.n2);
    this.f = atob(data.f).split('');
    this.x1 = Array.from(this.getx1(this.n1, this.n2));
    this.x2 = Array.from(this.getx1(this.n2, this.n1));
    this.cells = Array.from(document.querySelectorAll('#b div'));
},
  checkState: function() {
    let cnt = this.cells.reduce((t, x) =>  x.innerText === 'x' ? t+1 : t, 0); 
    if(cnt === 0) {
      let founded = this.multiplicationFounded();
      this.solution = this.x1[0][0] + ' &times; ' + this.x1[1][0];
      this.ended = founded;
      this.wrong = !founded;
    }
  },
  getp: function(x1) {
    return x1.reduce((t, x) =>  t+(String(x[0]) == '0' ? '' : String(x[0])), '');
  },
  multiplicationFounded: function() {
    let solution = this.cells.reduce((t, x) =>  t+x.innerText, 0);
    let s1 = this.getp(this.x1);
    let s2 = this.getp(this.x2);
    return '0'+s1+s2 == solution;
  },
  createInput: function(value) {
    let oldvalue = value;
    let input = document.createElement('input');
    input.type = 'number';
    input.inputMode = 'numeric';
    input.pattern = '[0-9]*';
    input.maxLength = 1;
    input.size = 1;
    input.className = 'input no-spin';
    if(value !== 'x') {
      input.value = value;
    }
    input.addEventListener('keydown', e => {
      if(isFinite(e.key)) {
        e.target.parentNode.innerText = e.key;
      } else if(e.key === 'Delete' || e.key === 'Backspace' || e.key === 'Process') {
        e.target.parentNode.innerText = 'x'; 
      } else {
        e.target.parentNode.innerText = oldvalue; 
      }
      e.target.remove();
      this.checkState();
    });
    input.addEventListener('blur', e => {
      e.target.parentNode.innerText = oldvalue; 
      e.target.remove();
    });
    return input;
  },
  aclick: function(e) {
    if(e.target.dataset.c && e.target.dataset.c >= 0) {
      if(e.ctrlKey) {
        e.target.innerText = this.f[e.target.dataset.c];
        this.checkState();
      } else if(!e.target.classList.contains('w')) {
        let value = e.target.innerText;
        e.target.innerText = '';
        let input = this.createInput(value);
        e.target.append(input);
        input.focus();
      }
    }
  },
  getx1: function*(n1, n2) {
    yield [n1, 0];
    yield [n2, 0];
    for(let n=n2.length, i=n-1;i>=0;i--) {
      yield [String(n2[i] * n1), n - i - 1];
    };
    yield [String(n1 * n2),0];
  },
  draw: function(x, pos) {
    x = Array.from(x);
    let p = 0;
    for(let i=0;i<x.length;i++) {
      let v = x[i][0];
      let vp = x[i][1];
      if(v === '0') {
        this.c = this.c + 1;
        continue;
      }
      this.drawNumber(v, vp, pos, p);
      p = p + 1;
    }
    this.drawLine(p, pos);
  },
  drawNumber: function(v, vp, pos, p) {
    for(let j=0, n=v.length;j<n;j++) {
      let cpos = (p + pos) * 9 + p + pos % 10+(10-n)-vp+j;
      let val = this.f[this.c];
      this.cells[cpos].innerText = val;
      this.cells[cpos].dataset.c = this.c;
      if(val != 'x') {
        this.cells[cpos].classList.add('w');
      }
      this.c = this.c + 1;
    }
  },
  drawLine: function(p, pos) {
    for(let i=0;i<10;i++) {
      let cpos = (p - 2 + pos) * 9 + p + 7 + pos % 10 - i;
      this.cells[cpos].classList.add('bb');
    }
  },
});
