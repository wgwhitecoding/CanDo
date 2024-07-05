document.addEventListener('DOMContentLoaded', function() {
    const createTaskBtn = document.getElementById('create-task-btn');
    const createColumnBtn = document.getElementById('create-column-btn');
    const taskModal = document.getElementById('task-modal');
    const columnModal = document.getElementById('column-modal');
    const editColumnModal = document.getElementById('edit-column-modal');
    const deleteConfirmationModal = document.getElementById('delete-confirmation-modal');
    const deleteColumnConfirmationModal = document.getElementById('delete-column-confirmation-modal');
    const moveDeleteTaskModal = document.getElementById('move-delete-task-modal');
    const taskForm = document.getElementById('task-form');
    const columnForm = document.getElementById('column-form');
    const editColumnForm = document.getElementById('edit-column-form');
    const closeBtns = document.querySelectorAll('.close-btn');
    let editingTaskID = null;
    let editingColumnID = null;
    let deletingTaskID = null;
    let deletingColumnID = null;

    // Function to show notifications
    function showNotification(message, type = 'success') {
        const notificationContainer = document.getElementById('notification-container');
        const alertType = type === 'success' ? 'alert-success' : 'alert-danger';
        const notification = `
            <div class="alert ${alertType} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        notificationContainer.innerHTML = notification;

        // Automatically close the notification after 5 seconds
        setTimeout(function() {
            notificationContainer.innerHTML = '';
        }, 5000);
    }

    // Event listeners for opening modals
    createTaskBtn.addEventListener('click', function() {
        taskModal.style.display = 'flex';
        taskForm.reset();
        editingTaskID = null;
    });

    createColumnBtn.addEventListener('click', function() {
        columnModal.style.display = 'flex';
        columnForm.reset();
        editingColumnID = null;
    });

    // Event listener for closing modals
    closeBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            taskModal.style.display = 'none';
            columnModal.style.display = 'none';
            editColumnModal.style.display = 'none';
            deleteConfirmationModal.style.display = 'none';
            deleteColumnConfirmationModal.style.display = 'none';
            moveDeleteTaskModal.style.display = 'none';
        });
    });

    // Event listener for task form submission
    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(taskForm);

        fetch(editingTaskID ? `/kanban/edit_task/${editingTaskID}/` : '/kanban/create_task/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showNotification('Task saved successfully', 'success');
                location.reload(); // Refresh the page after successful task operation
            } else {
                showNotification('Error saving task. Please try again.', 'error');
                console.error('Error saving task:', data);
            }
        })
        .catch(error => {
            showNotification('Error saving task. Please try again.', 'error');
            console.error('Error saving task:', error);
        });
    });

    // Event listener for column form submission
    columnForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(columnForm);

        fetch('/kanban/create_column/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showNotification('Column created successfully', 'success');
                location.reload(); // Refresh the page after successful column creation
            } else {
                showNotification('Error creating column. Please try again.', 'error');
                console.error('Error creating column:', data);
            }
        })
        .catch(error => {
            showNotification('Error creating column. Please try again.', 'error');
            console.error('Error creating column:', error);
        });
    });

    // Event listener for edit column form submission
    editColumnForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(editColumnForm);

        fetch(`/kanban/edit_column/${editingColumnID}/`, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showNotification('Column updated successfully', 'success');
                location.reload(); // Refresh the page after successful column update
            } else {
                showNotification('Error updating column. Please try again.', 'error');
                console.error('Error updating column:', data);
            }
        })
        .catch(error => {
            showNotification('Error updating column. Please try again.', 'error');
            console.error('Error updating column:', error);
        });
    });

    // Function to get CSRF token from cookies
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.startsWith(name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});























