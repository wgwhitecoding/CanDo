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

document.addEventListener('DOMContentLoaded', function() {
    const createColumnBtn = document.getElementById('create-column-btn');
    const columnModal = document.getElementById('column-modal');
    const columnForm = document.getElementById('column-form');
    const editColumnModal = document.getElementById('edit-column-modal');
    const editColumnForm = document.getElementById('edit-column-form');
    let editingColumnId = null;

    createColumnBtn.addEventListener('click', function() {
        columnModal.style.display = 'block';
    });

    columnForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(columnForm);
        console.log("Form Data: ", formData);
        fetch('/kanban/create_column/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            console.log("Data: ", data);
            if (data.status === 'success') {
                const columnBoard = document.querySelector('.kanban-board');
                const newColumn = document.createElement('div');
                newColumn.classList.add('kanban-column');
                newColumn.setAttribute('data-column-id', data.column_id);
    
                const columnHeader = document.createElement('button');
                columnHeader.classList.add('kanban-column-header');
                columnHeader.textContent = data.name;
                newColumn.appendChild(columnHeader);
    
                const columnBody = document.createElement('div');
                columnBody.classList.add('kanban-column-body');
                newColumn.appendChild(columnBody);
    
                columnBoard.appendChild(newColumn);
    
                columnModal.style.display = 'none';
                columnForm.reset();
                attachHeaderClickEvent();
            } else {
                console.error('Error creating column:', data.errors || data.message);
                alert(`Error creating column: ${data.errors || data.message}`);
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            alert('Error creating column');
        });
    });
    
    function attachHeaderClickEvent() {
        document.querySelectorAll('.kanban-column-header').forEach(columnHeader => {
            columnHeader.removeEventListener('click', openEditColumnModal);
            columnHeader.addEventListener('click', openEditColumnModal);
        });
    }

    function openEditColumnModal() {
        const columnId = this.closest('.kanban-column').getAttribute('data-column-id');
        const columnName = this.textContent;
        editingColumnId = columnId;
        document.getElementById('edit-column-name').value = columnName;
        editColumnModal.style.display = 'block';
    }

    attachHeaderClickEvent();

    editColumnForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const newName = document.getElementById('edit-column-name').value;
        fetch(`/kanban/edit_column/${editingColumnId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `name=${encodeURIComponent(newName)}`,
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const columnHeader = document.querySelector(`.kanban-column[data-column-id="${editingColumnId}"] .kanban-column-header`);
                columnHeader.textContent = newName;
                editColumnModal.style.display = 'none';
            } else {
                console.error('Error editing column');
                alert('Error editing column');
            }
        });
    });

    document.getElementById('delete-column-btn').addEventListener('click', function() {
        fetch(`/kanban/delete_column/${editingColumnId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const column = document.querySelector(`.kanban-column[data-column-id="${editingColumnId}"]`);
                column.remove();
                editColumnModal.style.display = 'none';
            } else {
                console.error('Error deleting column');
                alert('Error deleting column');
            }
        });
    });

    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
});








