document.addEventListener('DOMContentLoaded', function() {
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.zIndex = '9999'; // Set a very high z-index
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000); // Remove notification after 3 seconds
    }

    // Display Django messages as notifications
    const messages = document.querySelectorAll('#messages .message');
    messages.forEach(message => {
        const messageType = message.classList.contains('error') ? 'error' : 'success';
        showNotification(message.textContent, messageType);
    });
});

