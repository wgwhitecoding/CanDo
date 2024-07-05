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

    closeBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            closeAllModals();
        });
    });

    function closeAllModals() {
        taskModal.style.display = 'none';
        columnModal.style.display = 'none';
        editColumnModal.style.display = 'none';
        deleteConfirmationModal.style.display = 'none';
        deleteColumnConfirmationModal.style.display = 'none';
        moveDeleteTaskModal.style.display = 'none';
    }

    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const titleField = taskForm.querySelector('[name="title"]');
        const descriptionField = taskForm.querySelector('[name="description"]');
        const dueDateField = taskForm.querySelector('[name="due_date"]');
        const priorityField = taskForm.querySelector('[name="priority"]');

        if (titleField && descriptionField && dueDateField && priorityField) {
            const data = {
                title: titleField.value,
                description: descriptionField.value,
                due_date: dueDateField.value,
                priority: priorityField.value,
                column: 'New'
            };

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
                closeAllModals();
                if (data.status === 'success') {
                    showNotification('Task saved successfully', 'success');
                    setTimeout(() => location.reload(), 1000);
                } else {
                    showNotification('Error creating/editing task', 'error');
                }
            })
            .catch(error => {
                closeAllModals();
                showNotification('Error creating/editing task', 'error');
            });
        } else {
            showNotification('Please fill out all fields', 'error');
        }
    });

    columnForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const columnNameField = columnForm.querySelector('[name="column-name"]');

        if (columnNameField) {
            const data = { name: columnNameField.value };

            fetch('/kanban/create_column/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                closeAllModals();
                if (data.status === 'success') {
                    showNotification('Column created successfully', 'success');
                    setTimeout(() => location.reload(), 1000);
                } else {
                    showNotification('Error creating column', 'error');
                }
            })
            .catch(error => {
                closeAllModals();
                showNotification('Error creating column', 'error');
            });
        } else {
            showNotification('Please enter a column name', 'error');
        }
    });

    editColumnForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const editColumnNameField = editColumnForm.querySelector('[name="edit-column-name"]');

        if (editColumnNameField) {
            const data = { name: editColumnNameField.value };

            fetch(`/kanban/edit_column/${editingColumnID}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                closeAllModals();
                if (data.status === 'success') {
                    showNotification('Column updated successfully', 'success');
                    setTimeout(() => location.reload(), 1000);
                } else {
                    showNotification('Error editing column', 'error');
                }
            })
            .catch(error => {
                closeAllModals();
                showNotification('Error editing column', 'error');
            });
        } else {
            showNotification('Please enter a column name', 'error');
        }
    });

    document.getElementById('delete-column-btn').addEventListener('click', function() {
        deletingColumnID = editingColumnID;

        fetch(`/kanban/get_column/${editingColumnID}/`)
            .then(response => response.json())
            .then(columnData => {
                fetch(`/kanban/get_tasks_in_column/${editingColumnID}/`)
                    .then(response => response.json())
                    .then(tasks => {
                        if (tasks.length > 0) {
                            moveDeleteTaskModal.style.display = 'flex';
                        } else {
                            const confirmationText = `Are you sure you want to delete the column: "${columnData.name}"?`;
                            document.getElementById('delete-column-confirmation-text').innerText = confirmationText;
                            deleteColumnConfirmationModal.style.display = 'flex';
                        }
                    });
            });
    });

    document.getElementById('confirm-delete-column-btn').addEventListener('click', function() {
        fetch(`/kanban/delete_column/${deletingColumnID}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            closeAllModals();
            if (data.status === 'success') {
                showNotification('Column deleted successfully', 'success');
                setTimeout(() => location.reload(), 1000);
            } else {
                showNotification('Error deleting column', 'error');
            }
        })
        .catch(error => {
            closeAllModals();
            showNotification('Error deleting column', 'error');
        });
    });

    document.getElementById('close-move-delete-task-modal-btn').addEventListener('click', function() {
        moveDeleteTaskModal.style.display = 'none';
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

    document.querySelectorAll('.kanban-task').forEach(task => {
        task.addEventListener('click', function() {
            const taskDetails = this.querySelector('.kanban-task-details');
            const taskButtons = this.querySelectorAll('.kanban-task-details button');
            taskDetails.style.display = 'block';
            taskButtons.forEach(button => button.style.display = 'inline-block');

            const closeButton = this.querySelector('.close-task-btn');
            closeButton.addEventListener('click', function(e) {
                e.stopPropagation();
                taskDetails.style.display = 'none';
                taskButtons.forEach(button => button.style.display = 'none');
            });

            this.querySelector('.edit-task-btn').addEventListener('click', function() {
                editingTaskID = task.dataset.taskId;
                fetch(`/kanban/get_task/${editingTaskID}/`)
                .then(response => response.json())
                .then(data => {
                    taskForm.querySelector('[name="title"]').value = data.title;
                    taskForm.querySelector('[name="description"]').value = data.description;
                    taskForm.querySelector('[name="due_date"]').value = data.due_date;
                    taskForm.querySelector('[name="priority"]').value = data.priority;
                    taskModal.style.display = 'flex';
                });
            });

            this.querySelector('.delete-task-btn').addEventListener('click', function() {
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
            closeAllModals();
            if (data.status === 'success') {
                showNotification('Task deleted successfully', 'success');
                setTimeout(() => location.reload(), 1000);
            } else {
                showNotification('Error deleting task', 'error');
            }
        })
        .catch(error => {
            closeAllModals();
            showNotification('Error deleting task', 'error');
        });
    });

    document.querySelectorAll('.kanban-column-header').forEach(header => {
        header.addEventListener('click', function() {
            editingColumnID = this.parentElement.dataset.columnId;
            fetch(`/kanban/get_column/${editingColumnID}/`)
            .then(response => response.json())
            .then(data => {
                editColumnForm.querySelector('[name="edit-column-name"]').value = data.name;
                editColumnModal.style.display = 'flex';
            });
        });
    });

    // Drag and drop functionality
    document.querySelectorAll('.kanban-task').forEach(task => {
        task.setAttribute('draggable', true);

        task.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', this.dataset.taskId);
        });
    });

    document.querySelectorAll('.kanban-column-body').forEach(column => {
        column.addEventListener('dragover', function(e) {
            e.preventDefault();
        });

        column.addEventListener('drop', function(e) {
            e.preventDefault();
            const taskId = e.dataTransfer.getData('text/plain');
            const newColumnId = this.parentElement.dataset.columnId;
            const taskElement = document.querySelector(`.kanban-task[data-task-id='${taskId}']`);

            if (taskElement) {
                this.appendChild(taskElement); 

                fetch(`/kanban/move_task/${taskId}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({ column_id: newColumnId })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        showNotification('Task moved successfully', 'success');
                    } else {
                        showNotification('Error moving task', 'error');
                        location.reload(); 
                    }
                })
                .catch(error => {
                    showNotification('Error moving task', 'error');
                    location.reload(); 
                });
            }
        });
    });

});

























