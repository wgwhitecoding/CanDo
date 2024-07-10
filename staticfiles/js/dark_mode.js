document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.getElementById('darkModeToggle');
    const darkModeCss = document.getElementById('dark-mode-css');

    toggle.addEventListener('change', function () {
        if (this.checked) {
            enableDarkMode();
        } else {
            disableDarkMode();
        }
    });

    function enableDarkMode() {
        darkModeCss.disabled = false;
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
    }

    function disableDarkMode() {
        darkModeCss.disabled = true;
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
    }

    // Check local storage for dark mode setting
    if (localStorage.getItem('darkMode') === 'enabled') {
        toggle.checked = true;
        enableDarkMode();
    } else {
        toggle.checked = false;
        disableDarkMode();
    }
});
