(function() {
  try {
    var theme = localStorage.getItem('ajar-theme');
    var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
    if (!theme && supportDarkMode) theme = 'dark';
    if (!theme) theme = 'light';
    document.documentElement.classList.add(theme);
  } catch (e) {}
})();
