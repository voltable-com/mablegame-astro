export default () => ({
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
  })