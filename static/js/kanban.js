document.addEventListener("DOMContentLoaded", function () {
    const createColumnBtn = document.getElementById("create-column-btn");
    const columnModal = document.getElementById("column-modal");
    const closeModalBtn = columnModal.querySelector(".close-btn");
    const saveColumnBtn = columnModal.querySelector(".btn-primary");

    createColumnBtn.addEventListener("click", function () {
        columnModal.style.display = "block";
    });

    closeModalBtn.addEventListener("click", function () {
        columnModal.style.display = "none";
    });

    saveColumnBtn.addEventListener("click", function () {
        const columnName = document.getElementById("column-name").value;

        fetch("/kanban/create_column/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken")
            },
            body: JSON.stringify({ name: columnName })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                location.reload(); // Reload the page to display the new column
            } else {
                alert("Error creating column");
            }
        });
    });

    // Function to get CSRF token from cookies
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





