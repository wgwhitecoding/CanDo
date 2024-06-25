document.addEventListener('DOMContentLoaded', function () {
    const createColumnBtn = document.getElementById('create-column-btn');
    const columnModal = document.getElementById('column-modal');
    const columnForm = document.getElementById('column-form');
    const editColumnModal = document.getElementById('edit-column-modal');
    const editColumnForm = document.getElementById('edit-column-form');
    const deleteColumnBtn = document.getElementById('delete-column-btn');
    const closeBtns = document.querySelectorAll('.close-btn');
    let currentEditColumnId = null;

    createColumnBtn.addEventListener('click', function () {
        columnModal.style.display = 'flex';
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            columnModal.style.display = 'none';
            editColumnModal.style.display = 'none';
        });
    });

    window.addEventListener('click', function (event) {
        if (event.target === columnModal) {
            columnModal.style.display = 'none';
        }
        if (event.target === editColumnModal) {
            editColumnModal.style.display = 'none';
        }
    });

    columnForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const columnNameInput = document.getElementById('column-name');
        const columnName = columnNameInput.value.trim();

        if (columnName) {
            addColumn(columnName);
            columnModal.style.display = 'none';
            columnNameInput.value = '';
        }
    });

    editColumnForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const editColumnNameInput = document.getElementById('edit-column-name');
        const columnName = editColumnNameInput.value.trim();

        if (columnName && currentEditColumnId !== null) {
            updateColumn(currentEditColumnId, columnName);
            editColumnModal.style.display = 'none';
            editColumnNameInput.value = '';
        }
    });

    deleteColumnBtn.addEventListener('click', function () {
        if (currentEditColumnId !== null) {
            deleteColumn(currentEditColumnId);
            editColumnModal.style.display = 'none';
        }
    });

    document.querySelectorAll('.kanban-column-header').forEach(btn => {
        btn.addEventListener('click', function () {
            currentEditColumnId = this.closest('.kanban-column').dataset.columnId;
            document.getElementById('edit-column-id').value = currentEditColumnId;
            document.getElementById('edit-column-name').value = this.textContent;
            editColumnModal.style.display = 'flex';
        });
    });

    function addColumn(name) {
        const kanbanBoard = document.querySelector('.kanban-board');

        const columnDiv = document.createElement('div');
        columnDiv.classList.add('kanban-column');
        columnDiv.dataset.columnId = Date.now(); // Temporary ID for demonstration
        columnDiv.innerHTML = `
            <button class="kanban-column-header">${name}</button>
            <div class="kanban-column-body"></div>
        `;
        kanbanBoard.appendChild(columnDiv);

        columnDiv.querySelector('.kanban-column-header').addEventListener('click', function () {
            currentEditColumnId = columnDiv.dataset.columnId;
            document.getElementById('edit-column-id').value = currentEditColumnId;
            document.getElementById('edit-column-name').value = name;
            editColumnModal.style.display = 'flex';
        });
    }

    function updateColumn(id, name) {
        const column = document.querySelector(`.kanban-column[data-column-id="${id}"] .kanban-column-header`);
        if (column) {
            column.textContent = name;
        }
    }

    function deleteColumn(id) {
        const column = document.querySelector(`.kanban-column[data-column-id="${id}"]`);
        if (column) {
            column.remove();
        }
    }
});



