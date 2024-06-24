document.addEventListener('DOMContentLoaded', (event) => {
    const createTaskBtn = document.getElementById('create-task-btn');
    const createTaskForm = document.getElementById('create-task-form');
    const createTaskModal = new bootstrap.Modal(document.getElementById('create-task-modal'));
    const createColumnBtn = document.getElementById('create-column-btn');
    const createColumnForm = document.getElementById('create-column-form');
    const createColumnModal = new bootstrap.Modal(document.getElementById('create-column-modal'));

    createTaskBtn.addEventListener('click', () => {
        createTaskModal.show();
    });

    createTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(createTaskForm);
        fetch('/kanban/create_task/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                createTaskModal.hide();
                const taskHtml = `
                    <div class="task card mb-3" draggable="true" id="task-${data.task_id}">
                        <div class="card-body">
                            <h3 class="card-title">${data.title}</h3>
                            <p class="card-text">${data.due_date}</p>
                        </div>
                    </div>`;
                document.getElementById('tasks-New').insertAdjacentHTML('beforeend', taskHtml);
            }
        });
    });

    createColumnBtn.addEventListener('click', () => {
        createColumnModal.show();
    });

    createColumnForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(createColumnForm);
        fetch('/kanban/create_column/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                createColumnModal.hide();
                const columnHtml = `
                    <div class="column card" id="${data.name}">
                        <div class="card-body">
                            <h2 class="card-title">${data.name}</h2>
                            <div class="tasks" id="tasks-${data.name}"></div>
                        </div>
                    </div>`;
                document.getElementById('board').insertAdjacentHTML('beforeend', columnHtml);
            }
        });
    });

    // Add drag and drop functionality
    const tasks = document.querySelectorAll('.task');
    const columns = document.querySelectorAll('.tasks');

    tasks.forEach(task => {
        task.addEventListener('dragstart', dragStart);
    });

    columns.forEach(column => {
        column.addEventListener('dragover', dragOver);
        column.addEventListener('drop', drop);
    });

    function dragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.id);
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function drop(e) {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        const draggable = document.getElementById(id);
        e.target.appendChild(draggable);

        // Update the task stage via AJAX request
        const taskId = id.split('-')[1];
        const newStage = e.target.id.replace('tasks-', '');

        fetch(`/kanban/update_task_stage/${taskId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ stage: newStage })
        });
    }

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


