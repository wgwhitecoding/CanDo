document.addEventListener('DOMContentLoaded', function () {
    // Get URLs from data attributes
    const editProfileUrl = document.getElementById('editProfileModal').dataset.editProfileUrl;
    const deleteAccountUrl = document.getElementById('confirmDeleteModal').dataset.deleteAccountUrl;
    const logoutUrl = "{% url 'account_logout' %}";
    const loginUrl = "{% url 'account_login' %}";

    // Get the loading spinner element
    const loadingSpinner = document.getElementById('loadingSpinner');

    // Event listener for deleting the account
    document.getElementById('confirmDeleteAccountBtn').addEventListener('click', function () {
        loadingSpinner.style.display = 'block'; // Show spinner
        // Make an AJAX request to delete the account
        $.ajax({
            url: deleteAccountUrl,
            type: "POST",
            data: {
                csrfmiddlewaretoken: document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            success: function (response) {
                loadingSpinner.style.display = 'none'; // Hide spinner
                if (response.success) {
                    window.location.href = loginUrl;
                } else {
                    alert('Error deleting account');
                }
            },
            error: function (xhr, status, error) {
                loadingSpinner.style.display = 'none'; // Hide spinner
                console.error('Error:', error);
                alert('An error occurred while deleting the account.');
            }
        });
    });

    // Event listener for submitting the edit profile form
    document.getElementById('editProfileForm').addEventListener('submit', function (event) {
        event.preventDefault();
        loadingSpinner.style.display = 'block'; // Show spinner

        const formData = new FormData(this);

        // Compress the image before uploading
        const fileInput = document.getElementById('profileImage');
        const file = fileInput.files[0];
        if (file) {
            new Compressor(file, {
                quality: 0.6, // Adjust the quality as needed (0.6 means 60% quality)
                success(result) {
                    formData.set('profile_image', result, result.name);

                    // Upload the form data
                    $.ajax({
                        url: editProfileUrl,
                        type: "POST",
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function (response) {
                            loadingSpinner.style.display = 'none'; // Hide spinner
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
                            loadingSpinner.style.display = 'none'; // Hide spinner
                            console.error('Error:', error);
                            alert('An error occurred while updating the profile.');
                        }
                    });
                },
                error(err) {
                    loadingSpinner.style.display = 'none'; // Hide spinner
                    console.error('Error:', err);
                    alert('An error occurred while compressing the image.');
                }
            });
        } else {
            // No image file selected, just submit the form data as is
            $.ajax({
                url: editProfileUrl,
                type: "POST",
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    loadingSpinner.style.display = 'none'; // Hide spinner
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
                    loadingSpinner.style.display = 'none'; // Hide spinner
                    console.error('Error:', error);
                    alert('An error occurred while updating the profile.');
                }
            });
        }
    });

    // Event listener for logging out
    document.getElementById('confirmLogoutBtn').addEventListener('click', function () {
        window.location.href = logoutUrl;
    });
});











