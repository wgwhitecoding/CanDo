document.addEventListener('DOMContentLoaded', function () {
    const editProfileUrl = document.getElementById('editProfileModal').dataset.editProfileUrl;
    const changePasswordUrl = document.getElementById('changePasswordModal').dataset.changePasswordUrl;
    const deleteAccountUrl = document.getElementById('confirmDeleteModal').dataset.deleteAccountUrl;
    const logoutUrl = document.getElementById('logoutModal').dataset.logoutUrl;
    const uploadBackgroundImageUrl = '/kanban/upload_background_image/';

    const loadingSpinner = document.getElementById('loadingSpinner');

    document.getElementById('confirmDeleteAccountBtn').addEventListener('click', function () {
        loadingSpinner.style.display = 'block';
        $.ajax({
            url: deleteAccountUrl,
            type: "POST",
            data: {
                csrfmiddlewaretoken: document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            success: function (response) {
                loadingSpinner.style.display = 'none';
                if (response.success) {
                    window.location.href = response.redirect_url;
                } else {
                    showNotification('Error deleting account', 'error');
                }
            },
            error: function (xhr, status, error) {
                loadingSpinner.style.display = 'none';
                console.error('Error:', error);
                showNotification('An error occurred while deleting the account.', 'error');
            }
        });
    });

    document.getElementById('editProfileForm').addEventListener('submit', function (event) {
        event.preventDefault();
        loadingSpinner.style.display = 'block';
        const formData = new FormData(this);
        const fileInput = document.getElementById('profileImage');
        const file = fileInput.files[0];
        if (file) {
            new Compressor(file, {
                quality: 0.6,
                success(result) {
                    formData.set('profile_image', result, result.name);
                    $.ajax({
                        url: editProfileUrl,
                        type: "POST",
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function (response) {
                            loadingSpinner.style.display = 'none';
                            if (response.success) {
                                document.querySelector('#profileModal img').src = response.profile_picture_url;
                                document.querySelector('#profileDropdown img').src = response.profile_picture_url;
                                document.querySelector('#profileModal h3').textContent = response.user_name;
                                document.querySelector('#profileModal p.email').textContent = 'Email: ' + response.user_email;
                                document.querySelector('#profileModal p.bio').textContent = 'Bio: ' + response.user_bio;
                                $('#editProfileModal').modal('hide');
                                showNotification('Profile updated successfully', 'success');
                            } else {
                                showNotification('Error updating profile', 'error');
                            }
                        },
                        error: function (xhr, status, error) {
                            loadingSpinner.style.display = 'none';
                            console.error('Error:', error);
                            showNotification('An error occurred while updating the profile.', 'error');
                        }
                    });
                },
                error(err) {
                    loadingSpinner.style.display = 'none';
                    console.error('Error:', err);
                    showNotification('An error occurred while compressing the image.', 'error');
                }
            });
        } else {
            $.ajax({
                url: editProfileUrl,
                type: "POST",
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    loadingSpinner.style.display = 'none';
                    if (response.success) {
                        document.querySelector('#profileModal img').src = response.profile_picture_url;
                        document.querySelector('#profileDropdown img').src = response.profile_picture_url;
                        document.querySelector('#profileModal h3').textContent = response.user_name;
                        document.querySelector('#profileModal p.email').textContent = 'Email: ' + response.user_email;
                        document.querySelector('#profileModal p.bio').textContent = 'Bio: ' + response.user_bio;
                        $('#editProfileModal').modal('hide');
                        showNotification('Profile updated successfully', 'success');
                    } else {
                        showNotification('Error updating profile', 'error');
                    }
                },
                error: function (xhr, status, error) {
                    loadingSpinner.style.display = 'none';
                    console.error('Error:', error);
                    showNotification('An error occurred while updating the profile.', 'error');
                }
            });
        }
    });

    document.getElementById('changePasswordForm').addEventListener('submit', function (event) {
        event.preventDefault();
        loadingSpinner.style.display = 'block';
        const formData = new FormData(this);
        $.ajax({
            url: changePasswordUrl,
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                loadingSpinner.style.display = 'none';
                if (response.success) {
                    $('#changePasswordModal').modal('hide');
                    showNotification('Password changed successfully', 'success');
                } else {
                    showNotification('Error changing password', 'error');
                }
            },
            error: function (xhr, status, error) {
                loadingSpinner.style.display = 'none';
                console.error('Error:', error);
                showNotification('An error occurred while changing the password.', 'error');
            }
        });
    });

    document.getElementById('confirmLogoutBtn').addEventListener('click', function () {
        loadingSpinner.style.display = 'block';
        $.ajax({
            url: logoutUrl,
            type: "POST",
            data: {
                csrfmiddlewaretoken: document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            success: function (response) {
                loadingSpinner.style.display = 'none';
                if (response.success) {
                    window.location.href = response.redirect_url;
                } else {
                    showNotification('Error logging out', 'error');
                }
            },
            error: function (xhr, status, error) {
                loadingSpinner.style.display = 'none';
                console.error('Error:', error);
                showNotification('An error occurred while logging out.', 'error');
            }
        });
    });

    // Handle background image upload
    document.getElementById('saveSettingsBtn').addEventListener('click', function () {
        const backgroundImageInput = document.getElementById('backgroundImage');
        if (backgroundImageInput.files.length > 0) {
            loadingSpinner.style.display = 'block'; // Show loading spinner
            const formData = new FormData();
            formData.append('background_image', backgroundImageInput.files[0]);

            fetch(uploadBackgroundImageUrl, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                loadingSpinner.style.display = 'none'; // Hide loading spinner
                if (data.status === 'success') {
                    document.body.style.backgroundImage = `url('${data.image_url}')`;
                    $('#settingsModal').modal('hide');
                    showNotification('Background image updated successfully', 'success');
                } else {
                    showNotification('Failed to upload background image.', 'error');
                }
            })
            .catch(error => {
                loadingSpinner.style.display = 'none'; // Hide loading spinner
                console.error('Error:', error);
                showNotification('An error occurred while uploading the background image.', 'error');
            });
        }
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

    function showNotification(message, type) {
        // Assuming you have a function to show notifications
        // You can implement this function to display notifications to the user
        console.log(`${type}: ${message}`);
    }
});


















