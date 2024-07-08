document.addEventListener("DOMContentLoaded", function() {
    const toggle = document.getElementById('darkModeToggle');
    const darkModeCss = document.getElementById('dark-mode-css');

    toggle.addEventListener('change', function() {
        if (this.checked) {
            enableDarkMode();
        } else {
            disableDarkMode();
        }
    });

    function enableDarkMode() {
        darkModeCss.disabled = false;
    }

    function disableDarkMode() {
        darkModeCss.disabled = true;
    }

    // Check local storage for dark mode setting
    if (localStorage.getItem('darkMode') === 'enabled') {
        toggle.checked = true;
        enableDarkMode();
    }

    toggle.addEventListener('change', function() {
        if (this.checked) {
            localStorage.setItem('darkMode', 'enabled');
        } else {
            localStorage.setItem('darkMode', 'disabled');
        }
    });
});
