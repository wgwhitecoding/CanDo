document.addEventListener('DOMContentLoaded', function () {
    var messages = document.querySelectorAll('.alert');
    messages.forEach(function (message) {
        setTimeout(function () {
            message.style.display = 'none';
        }, 5000); // Adjust time as needed
    });
});


