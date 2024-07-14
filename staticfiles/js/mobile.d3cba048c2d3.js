// Add swipe functionality for kanban columns
$(document).ready(function() {
    var touchStartX = 0;
    var touchEndX = 0;

    $('.kanban-board-wrapper').on('touchstart', function(event) {
        touchStartX = event.changedTouches[0].screenX;
    });

    $('.kanban-board-wrapper').on('touchend', function(event) {
        touchEndX = event.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        var swipeDistance = touchStartX - touchEndX;
        if (swipeDistance > 50) {
            // Swipe left, navigate to next column if available
            $('.kanban-board-wrapper').animate({
                scrollLeft: $('.kanban-board-wrapper').scrollLeft() + $('.kanban-column').outerWidth() + 10
            }, 'fast');
        } else if (swipeDistance < -50) {
            // Swipe right, navigate to previous column if available
            $('.kanban-board-wrapper').animate({
                scrollLeft: $('.kanban-board-wrapper').scrollLeft() - $('.kanban-column').outerWidth() - 10
            }, 'fast');
        }
    }
});
