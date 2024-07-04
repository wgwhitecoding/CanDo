document.addEventListener('DOMContentLoaded', function() {
    const createTaskBtn = document.getElementById('create-task-btn');
    const createColumnBtn = document.getElementById('create-column-btn');
    const taskModal = document.getElementById('task-modal');
    const columnModal = document.getElementById('column-modal');
    const editColumnModal = document.getElementById('edit-column-modal');
    const deleteConfirmationModal = document.getElementById('delete-confirmation-modal');
    const taskForm = document.getElementById('task-form');
    const columnForm = document.getElementById('column-form');
    const editColumnForm = document.getElementById('edit-column-form');
    const closeBtns = document.querySelectorAll('.close-btn');
    let editingTaskID = null;
    let editingColumnID = null;
    let deletingTaskID = null;

    createTaskBtn.addEventListener('click', function() {
        console.log('Create Task Button Clicked');
        taskModal.style.display = 'flex';
        taskForm.reset();
        editingTaskID = null; // Reset editing task ID
    });

    createColumnBtn.addEventListener('click', function() {
        console.log('Create Column Button Clicked');
        columnModal.style.display = 'flex';
        columnForm.reset();
        editingColumnID = null; // Reset editing column ID
    });

    closeBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            console.log('Close Button Clicked');
            taskModal.style.display = 'none';
            columnModal.style.display = 'none';
            editColumnModal.style.display = 'none';
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
                priority: priorityField.value,
                column: 'New'  // Assigning the task to the "New" column by default
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

    columnForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const columnNameField = columnForm.querySelector('[name="column-name"]');
        console.log('Column Form:', columnForm);
        console.log('Column Name Field:', columnNameField);

        if (columnNameField) {
            const data = { name: columnNameField.value };
            console.log('Submitting column data:', data);

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
                console.log('Response from server:', data);
                if (data.status === 'success') {
                    location.reload();
                } else {
                    console.error('Error creating column:', data);
                    alert('Error creating column');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        } else {
            console.error('Column name field is missing');
        }
    });

    editColumnForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const editColumnNameField = editColumnForm.querySelector('[name="edit-column-name"]');
        console.log('Edit Column Form Submitted:', { editColumnNameField });

        if (editColumnNameField) {
            const data = { name: editColumnNameField.value };
            console.log('Submitting edit column data:', data);

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
                console.log('Response from server:', data);
                if (data.status === 'success') {
                    location.reload();
                } else {
                    console.error('Error editing column:', data);
                    alert('Error editing column');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        } else {
            console.error('Edit column name field is missing');
        }
    });

    document.getElementById('delete-column-btn').addEventListener('click', function() {
        console.log('Deleting column with ID:', editingColumnID);
        fetch(`/kanban/delete_column/${editingColumnID}/`, {
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
                console.error('Error deleting column:', data);
                alert('Error deleting column');
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

    document.querySelectorAll('.kanban-task').forEach(task => {
        task.addEventListener('click', function() {
            const taskDetails = this.querySelector('.kanban-task-details');
            const taskButtons = this.querySelectorAll('.kanban-task-details button');
            taskDetails.style.display = 'block';
            taskButtons.forEach(button => button.style.display = 'inline-block');

            this.querySelector('.close-task-btn').addEventListener('click', function() {
                taskDetails.style.display = 'none';
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

            console.log('Moving task ID:', taskId, 'to column ID:', newColumnId);

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
                console.log('Response from server:', data);
                if (data.status === 'success') {
                    location.reload();
                } else {
                    console.error('Error moving task:', data);
                    alert('Error moving task');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });
});

























