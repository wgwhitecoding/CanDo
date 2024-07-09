document.addEventListener('DOMContentLoaded', function () {
    // Get URLs from data attributes
    const editProfileUrl = document.getElementById('editProfileModal').dataset.editProfileUrl;
    const deleteAccountUrl = document.getElementById('confirmDeleteModal').dataset.deleteAccountUrl;
    const logoutUrl = "{% url 'account_logout' %}";
    const loginUrl = "{% url 'account_login' %}";

    // Event listener for deleting the account
    document.getElementById('confirmDeleteAccountBtn').addEventListener('click', function () {
        // Make an AJAX request to delete the account
        $.ajax({
            url: deleteAccountUrl,
            type: "POST",
            data: {
                csrfmiddlewaretoken: document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            success: function (response) {
                if (response.success) {
                    window.location.href = loginUrl;
                } else {
                    alert('Error deleting account');
                }
            },
            error: function (xhr, status, error) {
                console.error('Error:', error);
                alert('An error occurred while deleting the account.');
            }
        });
    });

    // Event listener for submitting the edit profile form
    document.getElementById('editProfileForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(this);

        $.ajax({
            url: editProfileUrl,
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
            },
            error: function (xhr, status, error) {
                console.error('Error:', error);
                alert('An error occurred while updating the profile.');
            }
        });
    });

    // Event listener for logging out
    document.getElementById('confirmLogoutBtn').addEventListener('click', function () {
        // Redirect to the logout URL
        window.location.href = logoutUrl;
    });
});











