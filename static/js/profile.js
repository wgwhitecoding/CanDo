document.addEventListener('DOMContentLoaded', function () {
    // Event listener for deleting the account
    document.getElementById('confirmDeleteAccount').addEventListener('click', function () {
        // Make an AJAX request to delete the account
        $.ajax({
            url: "{% url 'delete_account' %}", // Replace with your delete account view URL
            type: "POST",
            data: {
                csrfmiddlewaretoken: document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            success: function (response) {
                if (response.success) {
                    window.location.href = "{% url 'account_logout' %}"; // Replace with your logout URL
                } else {
                    alert('Error deleting account');
                }
            }
        });
    });

    // Event listener for submitting the edit profile form
    document.getElementById('editProfileForm').addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission
        const formData = new FormData(this);

        $.ajax({
            url: "{% url 'edit_profile' %}", // Replace with your edit profile view URL
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.success) {
                    // Update profile modal with new data
                    document.querySelector('#profileModal img').src = response.profile_picture_url;
                    document.querySelector('#profileModal h3').textContent = response.user_name;
                    document.querySelector('#profileModal p.email').textContent = 'Email: ' + response.user_email;
                    document.querySelector('#profileModal p.bio').textContent = 'Bio: ' + response.user_bio;
                    $('#editProfileModal').modal('hide'); // Hide the edit profile modal
                    alert('Profile updated successfully');
                } else {
                    alert('Error updating profile');
                }
            }
        });
    });
});




