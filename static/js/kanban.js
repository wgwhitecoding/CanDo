document.addEventListener('DOMContentLoaded', function() {
    const createTaskBtn = document.getElementById('create-task-btn');
    const createColumnBtn = document.getElementById('create-column-btn');
    const taskModal = document.getElementById('task-modal');
    const columnModal = document.getElementById('column-modal');
    const editColumnModal = document.getElementById('edit-column-modal');
    const taskForm = document.getElementById('task-form');
    const columnForm = document.getElementById('column-form');
    const editColumnForm = document.getElementById('edit-column-form');
    const closeBtns = document.querySelectorAll('.close-btn');
    let editingTaskID = null;
    let editingColumnID = null;

    createTaskBtn.addEventListener('click', function() {
        taskModal.style.display = 'flex';
        taskForm.reset();
        editingTaskID = null; // Reset editing task ID
    });

    createColumnBtn.addEventListener('click', function() {
        columnModal.style.display = 'flex';
        columnForm.reset();
        editingColumnID = null; // Reset editing column ID
    });

    closeBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            taskModal.style.display = 'none';
            columnModal.style.display = 'none';
            editColumnModal.style.display = 'none';
        });
    });

    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const data = {
            title: taskForm.querySelector('[name="title"]').value,
            description: taskForm.querySelector('[name="description"]').value,
            due_date: taskForm.querySelector('[name="due_date"]').value,
            priority: taskForm.querySelector('[name="priority"]').value,
            column: taskForm.querySelector('[name="column"]').value // Adjust this if column is not a field
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
            if (data.status === 'success') {
                location.reload();
            } else {
                alert('Error creating/editing task');
            }
        });
    });

    columnForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const data = {
            name: columnForm.querySelector('[name="column-name"]').value
        };
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
            if (data.status === 'success') {
                location.reload();
            } else {
                alert('Error creating column');
            }
        });
    });

    editColumnForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const data = {
            name: editColumnForm.querySelector('[name="edit-column-name"]').value
        };
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
            if (data.status === 'success') {
                location.reload();
            } else {
                alert('Error editing column');
            }
        });
    });

    document.getElementById('delete-column-btn').addEventListener('click', function() {
        fetch(`/kanban/delete_column/${editingColumnID}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                location.reload();
            } else {
                alert('Error deleting column');
            }
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
            editingTaskID = this.dataset.taskId;
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
                    location.reload();
                } else {
                    alert('Error moving task');
                }
            });
        });
    });
});



















