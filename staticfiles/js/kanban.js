document.addEventListener('DOMContentLoaded', function() {
    // Elements and Variables
    const createTaskBtn = document.getElementById('create-task-btn');
    const createColumnBtn = document.getElementById('create-column-btn');
    const taskModal = document.getElementById('task-modal');
    const columnModal = document.getElementById('column-modal');
    const editColumnModal = document.getElementById('edit-column-modal');
    const deleteConfirmationModal = document.getElementById('delete-confirmation-modal');
    const deleteColumnConfirmationModal = document.getElementById('delete-column-confirmation-modal');
    const moveDeleteTaskModal = document.getElementById('move-delete-task-modal');
    const deleteAttachmentConfirmationModal = document.getElementById('delete-attachment-confirmation-modal');
    const deleteAttachmentConfirmationText = document.getElementById('delete-attachment-confirmation-text');
    const confirmDeleteAttachmentBtn = document.getElementById('confirm-delete-attachment-btn');
    const taskForm = document.getElementById('task-form');
    const columnForm = document.getElementById('column-form');
    const editColumnForm = document.getElementById('edit-column-form');
    const closeBtns = document.querySelectorAll('.close-btn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    let editingTaskID = null;
    let editingColumnID = null;
    let deletingTaskID = null;
    let deletingColumnID = null;
    let deletingAttachmentID = null;

    // Mobile specific variables
    let currentColumn = 0;
    const board = document.querySelector('.kanban-board');
    const columns = document.querySelectorAll('.kanban-column');
    const totalColumns = columns.length;

    // Function to update transform for mobile swipe
    function updateTransform() {
        const transformValue = -currentColumn * 100;
        board.style.transform = `translateX(${transformValue}%)`;
    }

    document.getElementById('scroll-left').addEventListener('click', function() {
        if (currentColumn > 0) {
            currentColumn--;
            updateTransform();
        }
    });

    document.getElementById('scroll-right').addEventListener('click', function() {
        if (currentColumn < totalColumns - 1) {
            currentColumn++;
            updateTransform();
        }
    });

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
        document.getElementById('file-preview').innerHTML = ''; 
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
        deleteAttachmentConfirmationModal.style.display = 'none';
    }

    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(taskForm);
        formData.append('column', 'New');
        loadingSpinner.style.display = 'block';

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
            loadingSpinner.style.display = 'none';
            if (data.status === 'success') {
                if (!editingTaskID) {
                    showNotification('Task created successfully', 'success');
                    addTaskToColumn(data.task);
                } else {
                    showNotification('Task updated successfully', 'success');
                    updateTaskInColumn(data.task);
                }
            } else {
                showNotification('Error creating/editing task', 'error');
            }
        })
        .catch(error => {
            closeAllModals();
            loadingSpinner.style.display = 'none';
            showNotification('Error creating/editing task', 'error');
        });
    });

    columnForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const columnNameField = columnForm.querySelector('[name="column-name"]');
        if (columnNameField) {
            const data = { name: columnNameField.value };
            loadingSpinner.style.display = 'block';

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
                loadingSpinner.style.display = 'none';
                if (data.status === 'success') {
                    showNotification('Column created successfully', 'success');
                    addColumnToBoard(data.column);
                } else {
                    showNotification('Error creating column', 'error');
                }
            })
            .catch(error => {
                closeAllModals();
                loadingSpinner.style.display = 'none';
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
            loadingSpinner.style.display = 'block';

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
                loadingSpinner.style.display = 'none';
                if (data.status === 'success') {
                    showNotification('Column updated successfully', 'success');
                    updateColumnInBoard(editingColumnID, data.name);
                } else {
                    showNotification('Error editing column', 'error');
                }
            })
            .catch(error => {
                closeAllModals();
                loadingSpinner.style.display = 'none';
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
        loadingSpinner.style.display = 'block';
        fetch(`/kanban/delete_column/${deletingColumnID}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            closeAllModals();
            loadingSpinner.style.display = 'none';
            if (data.status === 'success') {
                showNotification('Column deleted successfully', 'success');
                const columnElement = document.querySelector(`.kanban-column[data-column-id="${deletingColumnID}"]`);
                if (columnElement) {
                    columnElement.remove();
                }
            } else {
                showNotification('Error deleting column', 'error');
            }
        })
        .catch(error => {
            closeAllModals();
            loadingSpinner.style.display = 'none';
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
            for (let i = 0; cookies.length > i; i++) {
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
                        attachmentDiv.id = `attachment-${attachment.id}`;
                        if (attachment.url.toLowerCase().endsWith('.pdf')) {
                            attachmentDiv.innerHTML = `
                                <a href="${attachment.url}" target="_blank">
                                    <img src="{% static 'images/pdf-icon.png' %}" alt="PDF" class="attachment-thumbnail">
                                    ${attachment.public_id}
                                </a>
                                <button type="button" class="btn btn-danger remove-attachment-btn" data-attachment-id="${attachment.id}">×</button>`;
                        } else {
                            attachmentDiv.innerHTML = `
                                <a href="${attachment.url}" target="_blank">
                                    <img src="${attachment.url}" alt="Attachment" class="attachment-thumbnail">
                                </a>
                                <button type="button" class="btn btn-danger remove-attachment-btn" data-attachment-id="${attachment.id}">×</button>`;
                        }
                        existingFilePreview.appendChild(attachmentDiv);

                        // Attach remove event
                        attachmentDiv.querySelector('.remove-attachment-btn').addEventListener('click', function(e) {
                            e.preventDefault();
                            const attachmentId = this.dataset.attachmentId;
                            const attachmentName = this.closest('.attachment').querySelector('a').innerText.trim();
                            showDeleteAttachmentConfirmation(attachmentId, attachmentName);
                        });
                    });
                });
            });

            this.querySelector('.delete-task-btn').addEventListener('click', function() {
                deletingTaskID = task.dataset.taskId;
                deleteConfirmationModal.style.display = 'flex';
            });

            // Move task functionality for small devices
            this.querySelector('.move-task-btn').addEventListener('click', function(e) {
                e.stopPropagation();
                const dropdown = this.nextElementSibling;
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            });

            this.querySelector('.move-task-dropdown').addEventListener('change', function() {
                const taskId = task.dataset.taskId;
                const columnId = this.value;
                fetch(`/kanban/move_task/${task.dataset.taskId}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({ column_id: columnId, position: 1 })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        showNotification('Task moved successfully', 'success');
                        setTimeout(() => location.reload(), 1000);
                    }
                })
                .catch(error => {
                    showNotification('Error moving task', 'error');
                });
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
    });

    function addColumnToBoard(column) {
        const columnElement = document.createElement('div');
        columnElement.className = 'kanban-column';
        columnElement.dataset.columnId = column.id;
        columnElement.dataset.columnName = column.name;
        columnElement.innerHTML = `
            <button class="kanban-column-header">${column.name}</button>
            <div class="kanban-column-body"></div>
        `;
        document.querySelector('.kanban-board').appendChild(columnElement);
    }

    function updateColumnInBoard(columnId, name) {
        const columnElement = document.querySelector(`.kanban-column[data-column-id="${columnId}"]`);
        if (columnElement) {
            columnElement.querySelector('.kanban-column-header').textContent = name;
        }
    }

    function moveTaskInDOM(taskId, columnId) {
        const taskElement = document.querySelector(`.kanban-task[data-task-id="${taskId}"]`);
        const newColumnBody = document.querySelector(`.kanban-column[data-column-id="${columnId}"] .kanban-column-body`);
        if (taskElement && newColumnBody) {
            newColumnBody.appendChild(taskElement);
        }
    }

    document.getElementById('confirm-delete-btn').addEventListener('click', function() {
        loadingSpinner.style.display = 'block';
        fetch(`/kanban/delete_task/${deletingTaskID}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            closeAllModals();
            loadingSpinner.style.display = 'none';
            if (data.status === 'success') {
                showNotification('Task deleted successfully', 'success');
                const taskElement = document.querySelector(`.kanban-task[data-task-id="${deletingTaskID}"]`);
                if (taskElement) {
                    taskElement.remove(); 
                }
            } else {
                showNotification('Error deleting task', 'error');
            }
        })
        .catch(error => {
            closeAllModals();
            loadingSpinner.style.display = 'none';
            showNotification('Error deleting task', 'error');
        });
    });

    document.querySelectorAll('.kanban-column-header').forEach(header => {
        header.addEventListener('click', function() {
            const columnName = this.textContent.trim();
            if (columnName === 'New' || columnName === 'To Do') {
                return; 
            }
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
                    this.insertBefore(taskElement, getDragAfterElement(this, e.clientY)); 
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
                <div class="kanban-task-title">
                    ${task.title}
                    <span class="priority-indicator ${getPriorityClass(task.priority)}"></span>
                </div>
                <div class="kanban-task-due">Due: ${task.due_date}</div>
                <div class="kanban-task-details" style="display: none;">
                    <p>${task.description}</p>
                    <div class="attachments"></div>
                    <button class="btn btn-primary edit-task-btn">Edit</button>
                    <button class="btn btn-danger delete-task-btn">Delete</button>
                    <button class="btn btn-secondary close-task-btn">Close</button>
                    <button class="btn btn-info move-task-btn">Move</button>
                    <select class="move-task-dropdown" style="display:none;">
                        {% for column in columns %}
                        <option value="{{ column.id }}">{{ column.name }}</option>
                        {% endfor %}
                    </select>
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
            newColumn.prepend(taskElement); 
            setupTaskEvents(taskElement); 
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

                    // Show existing file previews in the edit modal
                    const existingFilePreview = document.getElementById('existing-file-preview');
                    existingFilePreview.innerHTML = '';
                    data.attachments.forEach(attachment => {
                        const attachmentDiv = document.createElement('div');
                        attachmentDiv.className = 'attachment';
                        attachmentDiv.id = `attachment-${attachment.id}`;
                        if (attachment.url.toLowerCase().endsWith('.pdf')) {
                            attachmentDiv.innerHTML = `
                                <a href="${attachment.url}" target="_blank">
                                    <img src="{% static 'images/pdf-icon.png' %}" alt="PDF" class="attachment-thumbnail">
                                    ${attachment.public_id}
                                </a>
                                <button type="button" class="btn btn-danger remove-attachment-btn" data-attachment-id="${attachment.id}">×</button>`;
                        } else {
                            attachmentDiv.innerHTML = `
                                <a href="${attachment.url}" target="_blank">
                                    <img src="${attachment.url}" alt="Attachment" class="attachment-thumbnail">
                                </a>
                                <button type="button" class="btn btn-danger remove-attachment-btn" data-attachment-id="${attachment.id}">×</button>`;
                        }
                        existingFilePreview.appendChild(attachmentDiv);

                        // Attach remove event
                        attachmentDiv.querySelector('.remove-attachment-btn').addEventListener('click', function(e) {
                            e.preventDefault();
                            const attachmentId = this.dataset.attachmentId;
                            const attachmentName = this.closest('.attachment').querySelector('a').innerText.trim();
                            showDeleteAttachmentConfirmation(attachmentId, attachmentName);
                        });
                    });
                });
            });

            this.querySelector('.delete-task-btn').addEventListener('click', function() {
                deletingTaskID = task.dataset.taskId;
                deleteConfirmationModal.style.display = 'flex';
            });

            // Move task functionality for small devices
            this.querySelector('.move-task-btn').addEventListener('click', function(e) {
                e.stopPropagation();
                const dropdown = this.nextElementSibling;
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            });

            this.querySelector('.move-task-dropdown').addEventListener('change', function() {
                const taskId = task.dataset.taskId;
                const columnId = this.value;
                fetch(`/kanban/move_task/${task.dataset.taskId}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({ column_id: columnId, position: 1 })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        showNotification('Task moved successfully', 'success');
                        setTimeout(() => location.reload(), 1000);
                    }
                })
                .catch(error => {
                    showNotification('Error moving task', 'error');
                });
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

    function updateTaskInColumn(task) {
        const taskElement = document.querySelector(`.kanban-task[data-task-id="${task.id}"]`);
        if (taskElement) {
            taskElement.innerHTML = `
                <div class="kanban-task-title">
                    ${task.title}
                    <span class="priority-indicator ${getPriorityClass(task.priority)}"></span>
                </div>
                <div class="kanban-task-due">Due: ${task.due_date}</div>
                <div class="kanban-task-details" style="display: none;">
                    <p>${task.description}</p>
                    <div class="attachments"></div>
                    <button class="btn btn-primary edit-task-btn">Edit</button>
                    <button class="btn btn-danger delete-task-btn">Delete</button>
                    <button class="btn btn-secondary close-task-btn">Close</button>
                    <button class="btn btn-info move-task-btn">Move</button>
                    <select class="move-task-dropdown" style="display:none;">
                        {% for column in columns %}
                        <option value="{{ column.id }}">{{ column.name }}</option>
                        {% endfor %}
                    </select>
                </div>
            `;
            setupTaskEvents(taskElement);
        }
    }

    document.querySelectorAll('.kanban-task').forEach(setupTaskEvents);

    // Handle attachment removal
    document.querySelectorAll('.remove-attachment-btn').forEach(button => {
        button.addEventListener('click', function() {
            const attachmentId = this.dataset.attachmentId;
            const attachmentName = this.closest('.attachment').querySelector('a').innerText.trim();
            showDeleteAttachmentConfirmation(attachmentId, attachmentName);
        });
    });

    // Handle file previews for new attachments
    const attachmentsInput = document.getElementById('attachments');
    attachmentsInput.addEventListener('change', function() {
        const previewContainer = document.getElementById('file-preview');
        previewContainer.innerHTML = '';
        Array.from(this.files).forEach(file => {
            const fileReader = new FileReader();
            fileReader.onload = function(e) {
                const div = document.createElement('div');
                div.classList.add('attachment');
                if (file.type === 'application/pdf') {
                    div.innerHTML = `
                        <a href="${e.target.result}" target="_blank">
                            <img src="{% static 'images/pdf-icon.png' %}" alt="PDF" class="attachment-thumbnail">
                            ${file.name}
                        </a>
                    `;
                } else {
                    div.innerHTML = `
                        <a href="${e.target.result}" target="_blank">
                            <img src="${e.target.result}" alt="Attachment" class="attachment-thumbnail">
                        </a>
                    `;
                }
                previewContainer.appendChild(div);
            };
            fileReader.readAsDataURL(file);
        });
    });

    function removeAttachment(button) {
        const attachmentId = button.getAttribute('data-attachment-id');
        fetch(`/kanban/remove_attachment/${attachmentId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json',
            }
        }).then(response => response.json()).then(data => {
            if (data.status === 'success') {
                document.getElementById(`attachment-${attachmentId}`).remove();
            } else {
                alert('Error removing attachment');
            }
        });
    }

    // Function to show the delete attachment confirmation modal
    function showDeleteAttachmentConfirmation(attachmentId, attachmentName) {
        deletingAttachmentID = attachmentId;
        deleteAttachmentConfirmationText.innerText = `Are you sure you want to delete the attachment: "${attachmentName}"?`;
        deleteAttachmentConfirmationModal.style.display = 'flex';
    }

    // Event listener for confirming attachment deletion
    confirmDeleteAttachmentBtn.addEventListener('click', function() {
        if (deletingAttachmentID) {
            loadingSpinner.style.display = 'block';
            fetch(`/kanban/remove_attachment/${deletingAttachmentID}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            })
            .then(response => response.json())
            .then(data => {
                closeAllModals();
                loadingSpinner.style.display = 'none';
                if (data.status === 'success') {
                    showNotification('Attachment removed successfully', 'success');
                    document.getElementById(`attachment-${deletingAttachmentID}`).remove(); 
                } else {
                    showNotification('Error removing attachment', 'error');
                }
            })
            .catch(error => {
                closeAllModals();
                loadingSpinner.style.display = 'none';
                showNotification('Error removing attachment', 'error');
            });
        }
    });

    // Mobile swipe functionality
    let startX;
    let endX;

    document.querySelector('.kanban-board-wrapper').addEventListener('touchstart', function(event) {
        startX = event.touches[0].pageX;
    });

    document.querySelector('.kanban-board-wrapper').addEventListener('touchmove', function(event) {
        endX = event.touches[0].pageX;
    });

    document.querySelector('.kanban-board-wrapper').addEventListener('touchend', function(event) {
        const distance = endX - startX;
        if (distance > 50) {
            document.getElementById('scroll-left').click();
        } else if (distance < -50) {
            document.getElementById('scroll-right').click();
        }
    });

    function getPriorityClass(priority) {
        switch (priority) {
            case 'Low':
                return 'priority-low';
            case 'Medium':
                return 'priority-medium';
            case 'High':
                return 'priority-high';
            case 'Done':
                return 'priority-done';
            default:
                return '';
        }
    }
});













