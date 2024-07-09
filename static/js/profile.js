document.addEventListener('DOMContentLoaded', function () {
    // Event listener for deleting the account
    document.getElementById('confirmDeleteAccount').addEventListener('click', function () {
        // Make an AJAX request to delete the account
        $.ajax({
            url: "{% url 'kanban:delete_account' %}",
            type: "POST",
            data: {
                csrfmiddlewaretoken: document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            success: function (response) {
                if (response.success) {
                    window.location.href = "{% url 'account_logout' %}";
                } else {
                    alert('Error deleting account');
                }
            }
        });
    });

    // Event listener for submitting the edit profile form
    document.getElementById('editProfileForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(this);

        $.ajax({
            url: "{% url 'kanban:edit_profile_api' %}",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.success) {
                    // Update profile modal with new data
                    document.querySelector('#profileModal img').src = response.profile_picture_url;
                    document.querySelector('#profileDropdown img').src = response.profile_picture_url;
                    document.querySelector('#profileModal h3').textContent = response.user_name;
                    document.querySelector('#profileModal p.email').textContent = 'Email: ' + response.user_email;
                    document.querySelector('#profileModal p.bio').textContent = 'Bio: ' + response.user_bio;
                    $('#editProfileModal').modal('hide');
                    alert('Profile updated successfully');
                } else {
                    alert('Error updating profile');
                }
            }
        });
    });

    // Event listener for logging out
    document.getElementById('confirmLogout').addEventListener('click', function () {
        // Redirect to the logout URL
        window.location.href = "{% url 'account_logout' %}";
    });
});





