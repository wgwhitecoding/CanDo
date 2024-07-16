document.addEventListener('DOMContentLoaded', function() {
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Display Django messages as notifications
    const messages = document.querySelectorAll('#messages .message');
    messages.forEach(message => {
        const messageType = message.classList.contains('error') ? 'error' : 'success';
        showNotification(message.textContent, messageType);
    });

    // Expose showNotification function globally for other scripts to use
    window.showNotification = showNotification;
});


