document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form[action*="account_login"]');
    const logoutForm = document.querySelector('form[action*="account_logout"]');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(loginForm);

            fetch(loginForm.action, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.location) {
                    showNotification('Logged in successfully', 'success');
                    setTimeout(() => window.location.href = data.location, 1000);
                } else {
                    showNotification('Invalid credentials', 'error');
                }
            })
            .catch(error => {
                showNotification('Error logging in', 'error');
            });
        });
    }

    if (logoutForm) {
        logoutForm.addEventListener('submit', function(e) {
            e.preventDefault();

            fetch(logoutForm.action, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            })
            .then(response => response.json())
            .then(data => {
                showNotification('Logged out successfully', 'success');
                setTimeout(() => window.location.href = '/', 1000);
            })
            .catch(error => {
                showNotification('Error logging out', 'error');
            });
        });
    }

    // Function to display notifications
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000); // Remove notification after 3 seconds
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});

