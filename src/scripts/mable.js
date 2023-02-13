export default () => ({
  count: 0,
  guesses:[],
  numbertoguess: '00000',
  ended: false,
  wrong: false,
  n: '?????',
  l:'standard',
  m: 15,
  msg: false,
  t:true,
  init: function() {
    this.count = 0;
    this.ended = false,
    this.wrong = false,
    this.guesses = [
      {v: '     ',p:'',m:''}
    ];
    if(this.t) {
      this.$refs.binary.checked = false;
      this.$refs.easy.checked = false;
    }
    this.n = '?????';
    this.getng();

  },
  getng: function() {
    let n = '';
    switch(this.l) 
    {
      case 'easy':
        n = this.getn();
        break;
      case 'binary':
        n = this.getb();
        break;
      default:
        n = this.gets(); 
    }

    this.numbertoguess = this.F(n);
  },
  gets: function() {
    return String(Math.floor(Math.random()*99999)).padStart(5,'0');
  },
  getb: function() {
    let n = '';
    for(let i = 0;i<5;i++) {
        let r = Math.floor(Math.random()*2);
        n += r;
    }
    return n;
  },
  getn: function() {
      let a = '0123456789';
      let n = '';
      for(let i = 0;i<5;i++) {
          let r = a[Math.floor(Math.random()*a.length)];
          n += r;
          a = a.replace(r,'');
      }
      return n;
  },
  input: function(e) {
    if(this.l == 'binary') {
      e.target.value = e.target.value
        .replace(/[^0-1]/g, '')
        .replace(/(\d{5})\d/g, '$1');
    } else {
      e.target.value = e.target.value
      .replace(/[^0-9]/g, '')
      .replace(/(\d{5})\d/g, '$1');
    }
  },
  level: function(e) {
    if(!confirm("Current progress will be lost! Reset the game?")) {
      e.target.checked = !e.target.checked;
      return;
    }

    this.t = false;
    let l = 'standard';
    let m = 15;
    if(e.target.checked) {
      if(e.target.value == 'easy') {
        this.$refs.binary.checked = false;
        l = 'easy';
      }
      if(e.target.value == 'binary') {
        this.$refs.easy.checked = false;
        l = 'binary';
        m = 5;
      }
    }
    if(this.l != l) {
      this.l = l;
      this.m = m;
      this.init();
    }
  },
  exists: function(value) {
    let r = false;
    this.guesses.forEach(x=> {
        if(x.v == value) {
          r = true;
        }
    });
    return r;
  },
  keypress: function(e) {
    if(this.ended || this.wrong) {
      e.target.value = '';
    }
    let value = e.target.value;
    if(value.length != 5) {
      return;
    }

    let ng = this.f();
    if(!this.exists(value)) {
      this.count = this.count + 1;
      let m = null;
      if(value == ng && !this.ended) {
        this.ended = true;
        this.n = value;
        m = {
          v: value,
          p:'5p',
          m:'-'
        }
      } else if(this.count >= this.m) {
        this.wrong = true;
        this.n = ng;
        m = {
          v: ng,
          p:'-',
          m:'-'
        };
      }

      if(!this.ended || !this.wrong) {
        let pm = this.guesspattern(value);
        m = {
          v: value,
          p:pm[0],
          m:pm[1]
        };
      }
      if(m) {
        this.guesses.splice(0,0,m);
      }
    } else {
      this.msg = true;
      setTimeout(() => this.msg = false, 1500);
    }
    e.target.value = '';
  },
  guesspattern: function(v) {
    let p = 0, m = 0;
    let g = Array.from(this.f());
    v = Array.from(v);
    for(let i=0, len = v.length; i< len;i++) {
      if(v[i] == g[i]) {
        p = p + 1;
        g[i] = 'x';
        v[i] = 'y';
      }
    }

    for(let i=0, len = v.length; i< len;i++) {
      let ii = g.indexOf(v[i]);
      if(ii>-1) {
        m = m + 1;
        g[ii] = 'x';
      }
    }

    p = p+'p';
    m = m+'m';
    if(p == '0p') p = '-';
    if(m == '0m') m = '-';
    return [p,m];
  },
  F: function(n) {
    n = '1' + n;
    n = BigInt(parseInt(n));
    let cryptbase1 = BigInt(12345678909876)
    let cryptbase2 = BigInt(234567890987654);
 
    return (n + cryptbase1) ^ cryptbase2;
  },
  f: function() {
    let cryptbase1 = BigInt(12345678909876)
    let cryptbase2 = BigInt(234567890987654);

    let d =(this.numbertoguess ^ cryptbase2) - cryptbase1;
    return d.toString().slice(1); 
  }

})