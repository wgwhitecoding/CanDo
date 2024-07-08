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
        document.getElementById('existing-file-preview').innerHTML = ''; // Clear existing file previews
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
        const formData = new FormData(taskForm);
        formData.append('column', 'New');

        fetch(editingTaskID ? `/kanban/edit_task/${editingTaskID}/` : '/kanban/create_task/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            closeAllModals();
            if (data.status === 'success') {
                showNotification('Task saved successfully', 'success');
                if (!editingTaskID) {
                    addTaskToColumn(data.task); // Assuming the server returns the new task data
                }
                setTimeout(() => location.reload(), 1000);
            } else {
                showNotification('Error creating/editing task', 'error');
            }
        })
        .catch(error => {
            closeAllModals();
            showNotification('Error creating/editing task', 'error');
        });
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
                const columnElement = document.querySelector(`.kanban-column[data-column-id="${deletingColumnID}"]`);
                if (columnElement) {
                    columnElement.remove(); // Remove the column element from the DOM
                }
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

                    // Show existing file previews in the edit modal
                    const existingFilePreview = document.getElementById('existing-file-preview');
                    existingFilePreview.innerHTML = '';
                    data.attachments.forEach(attachment => {
                        const attachmentDiv = document.createElement('div');
                        attachmentDiv.className = 'attachment';
                        if (attachment.is_pdf) {
                            attachmentDiv.innerHTML = `<a href="${attachment.file.url}" target="_blank">${attachment.file.name}</a>
                                <button class="btn btn-danger remove-attachment-btn" data-attachment-id="${attachment.id}">×</button>`;
                        } else {
                            attachmentDiv.innerHTML = `<a href="${attachment.file.url}" target="_blank"><img src="${attachment.file.url}" alt="Attachment" class="attachment-thumbnail"></a>
                                <button class="btn btn-danger remove-attachment-btn" data-attachment-id="${attachment.id}">×</button>`;
                        }
                        existingFilePreview.appendChild(attachmentDiv);

                        // Attach remove event
                        attachmentDiv.querySelector('.remove-attachment-btn').addEventListener('click', function(e) {
                            e.preventDefault();
                            const attachmentId = this.dataset.attachmentId;
                            if (confirm('Are you sure you want to delete this attachment?')) {
                                fetch(`/kanban/remove_attachment/${attachmentId}/`, {
                                    method: 'POST',
                                    headers: {
                                        'X-CSRFToken': getCookie('csrftoken')
                                    }
                                })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.status === 'success') {
                                        showNotification('Attachment removed successfully', 'success');
                                        attachmentDiv.remove(); // Remove attachment element from the DOM
                                    } else {
                                        showNotification('Error removing attachment', 'error');
                                    }
                                })
                                .catch(error => {
                                    showNotification('Error removing attachment', 'error');
                                });
                            }
                        });
                    });
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
                const taskElement = document.querySelector(`.kanban-task[data-task-id="${deletingTaskID}"]`);
                if (taskElement) {
                    taskElement.remove(); // Remove the task element from the DOM
                }
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
            task.classList.add('dragging');
            e.dataTransfer.setData('text/plain', this.dataset.taskId);
        });

        task.addEventListener('dragend', function() {
            task.classList.remove('dragging');
        });
    });

    document.querySelectorAll('.kanban-column-body').forEach(column => {
        column.addEventListener('dragover', function(e) {
            e.preventDefault();
            const afterElement = getDragAfterElement(column, e.clientY);
            const draggable = document.querySelector('.dragging');
            if (afterElement == null) {
                column.appendChild(draggable);
            } else {
                column.insertBefore(draggable, afterElement);
            }
        });

        column.addEventListener('drop', function(e) {
            e.preventDefault();
            const taskId = e.dataTransfer.getData('text/plain');
            const newColumnId = this.parentElement.dataset.columnId;
            const taskElement = document.querySelector(`.kanban-task[data-task-id="${taskId}"]`);

            let position = Array.from(this.children).indexOf(taskElement) + 1;

            fetch(`/kanban/move_task/${taskId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ column_id: newColumnId, position: position })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    showNotification('Task moved successfully', 'success');
                    this.insertBefore(taskElement, getDragAfterElement(this, e.clientY)); // Move task instantly in the DOM
                } else {
                    showNotification('Error moving task', 'error');
                }
            })
            .catch(error => {
                showNotification('Error moving task', 'error');
            });
        });
    });

    function getDragAfterElement(column, y) {
        const draggableElements = [...column.querySelectorAll('.kanban-task:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function addTaskToColumn(task) {
        const newColumn = document.querySelector('.kanban-column[data-column-name="New"] .kanban-column-body');
        if (newColumn) {
            const taskElement = document.createElement('div');
            taskElement.className = 'kanban-task';
            taskElement.dataset.taskId = task.id;
            taskElement.innerHTML = `
                <div class="kanban-task-details">
                    <h3>${task.title}</h3>
                    <p>${task.description}</p>
                    <p>Due: ${task.due_date}</p>
                    <p>Priority: ${task.priority}</p>
                    <button class="edit-task-btn">Edit</button>
                    <button class="delete-task-btn">Delete</button>
                    <button class="close-task-btn">Close</button>
                </div>
            `;
            taskElement.setAttribute('draggable', true);
            taskElement.addEventListener('dragstart', function(e) {
                taskElement.classList.add('dragging');
                e.dataTransfer.setData('text/plain', task.id);
            });
            taskElement.addEventListener('dragend', function() {
                taskElement.classList.remove('dragging');
            });
            newColumn.prepend(taskElement); // Add task to the top of the column
            setupTaskEvents(taskElement); // Set up event listeners for the new task element
        }
    }

    function setupTaskEvents(task) {
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

        task.setAttribute('draggable', true);

        task.addEventListener('dragstart', function(e) {
            task.classList.add('dragging');
            e.dataTransfer.setData('text/plain', task.dataset.taskId);
        });

        task.addEventListener('dragend', function() {
            task.classList.remove('dragging');
        });
    }

    document.querySelectorAll('.kanban-task').forEach(setupTaskEvents);

});

