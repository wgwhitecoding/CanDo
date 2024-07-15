document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.getElementById('darkModeToggle');
    const darkModeCss = document.getElementById('dark-mode-css');

    toggle.addEventListener('change', function () {
        if (this.checked) {
            console.log("Enabling dark mode");
            enableDarkMode();
        } else {
            console.log("Disabling dark mode");
            disableDarkMode();
        }
    });

    function enableDarkMode() {
        console.log("Dark mode enabled");
        darkModeCss.disabled = false;
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
    }

    function disableDarkMode() {
        console.log("Dark mode disabled");
        darkModeCss.disabled = true;
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
    }

    // Check local storage for dark mode setting
    if (localStorage.getItem('darkMode') === 'enabled') {
        console.log("Dark mode is enabled");
        toggle.checked = true;
        enableDarkMode();
    } else {
        console.log("Dark mode is disabled");
        toggle.checked = false;
        disableDarkMode();
    }
});





