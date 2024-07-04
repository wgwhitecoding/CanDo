document.addEventListener('DOMContentLoaded', function() {
    const taskModal = document.getElementById('task-modal');
    const taskForm = document.getElementById('task-form');
    const deleteConfirmationModal = document.getElementById('delete-confirmation-modal');
    const closeBtns = document.querySelectorAll('.close-btn');
    let editingTaskID = null;
    let deletingTaskID = null;

    closeBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            console.log('Close Button Clicked');
            taskModal.style.display = 'none';
            deleteConfirmationModal.style.display = 'none';
        });
    });

    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const titleField = taskForm.querySelector('[name="title"]');
        const descriptionField = taskForm.querySelector('[name="description"]');
        const dueDateField = taskForm.querySelector('[name="due_date"]');
        const priorityField = taskForm.querySelector('[name="priority"]');
        console.log('Task Form Submitted:', {
            titleField, descriptionField, dueDateField, priorityField
        });

        if (titleField && descriptionField && dueDateField && priorityField) {
            const data = {
                title: titleField.value,
                description: descriptionField.value,
                due_date: dueDateField.value,
                priority: priorityField.value
            };
            console.log('Submitting task data:', data);

            fetch(editingTaskID ? `/kanban/edit_task/${editingTaskID}/` : '/kanban/create_task/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Response from server:', data);
                if (data.status === 'success') {
                    location.reload();
                } else {
                    console.error('Error creating/editing task:', data);
                    alert('Error creating/editing task');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        } else {
            console.error('One or more form fields are missing');
        }
    });

    document.querySelectorAll('.kanban-task').forEach(task => {
        task.addEventListener('click', function() {
            const taskDetails = this.querySelector('.kanban-task-details');
            const taskButtons = this.querySelectorAll('.kanban-task-details button');
            taskDetails.style.display = 'block';
            taskButtons.forEach(button => button.style.display = 'inline-block');

            const closeButton = this.querySelector('.close-task-btn');
            closeButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent the click event from bubbling up to the task element
                console.log('Close Button Clicked');
                taskDetails.style.display = 'none';
                taskButtons.forEach(button => button.style.display = 'none');
            });

            const editButton = this.querySelector('.edit-task-btn');
            editButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent the click event from bubbling up to the task element
                editingTaskID = task.dataset.taskId;
                console.log('Editing Task ID:', editingTaskID);
                fetch(`/kanban/get_task/${editingTaskID}/`)
                .then(response => response.json())
                .then(data => {
                    console.log('Fetched Task Data:', data);
                    taskForm.querySelector('[name="title"]').value = data.title;
                    taskForm.querySelector('[name="description"]').value = data.description;
                    taskForm.querySelector('[name="due_date"]').value = data.due_date;
                    taskForm.querySelector('[name="priority"]').value = data.priority;
                    taskModal.style.display = 'flex';
                });
            });

            const deleteButton = this.querySelector('.delete-task-btn');
            deleteButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent the click event from bubbling up to the task element
                deletingTaskID = task.dataset.taskId;
                deleteConfirmationModal.style.display = 'flex';
            });
        });
    });

    document.getElementById('confirm-delete-btn').addEventListener('click', function() {
        fetch(`/kanban/delete_task/${deletingTaskID}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Response from server:', data);
            if (data.status === 'success') {
                location.reload();
            } else {
                console.error('Error deleting task:', data);
                alert('Error deleting task');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

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




