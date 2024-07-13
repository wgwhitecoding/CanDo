document.addEventListener('DOMContentLoaded', function () {
    // Variables for various URLs
    const editProfileUrl = document.getElementById('editProfileModal').dataset.editProfileUrl;
    const changePasswordUrl = document.getElementById('changePasswordModal').dataset.changePasswordUrl;
    const deleteAccountUrl = document.getElementById('confirmDeleteModal').dataset.deleteAccountUrl;
    const logoutUrl = document.getElementById('logoutModal').dataset.logoutUrl;
    const uploadBackgroundImageUrl = '/kanban/upload_background_image/';
    const saveBackgroundSettingsUrl = '/kanban/save_background_settings/';
    const loadingSpinner = document.getElementById('loadingSpinner');

    // Function to get CSRF token
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

    // Function to show notifications
    function showNotification(message, type) {
        // Assuming you have a function to show notifications
        // You can implement this function to display notifications to the user
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000); // Remove notification after 3 seconds
    }

    // Delete Account
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
                    showNotification('Account deleted successfully', 'success');
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

    // Edit Profile
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

    // Change Password
    document.addEventListener('DOMContentLoaded', function () {
        // Ensure that the URL for changing password is correctly fetched from the modal attribute
        const changePasswordUrl = document.getElementById('changePasswordModal').dataset.changePasswordUrl;
    
        // Ensure the loading spinner element is accessible
        const loadingSpinner = document.getElementById('loadingSpinner');
    
        // Add event listener for the change password form submission
        document.getElementById('changePasswordForm').addEventListener('submit', function (event) {
            event.preventDefault();  // Prevent the default form submission
    
            loadingSpinner.style.display = 'block';  // Show the loading spinner
    
            const formData = new FormData(this);  // Create a FormData object with the form data
    
            $.ajax({
                url: changePasswordUrl,  // Use the change password URL
                type: "POST",  // Send the request as POST
                data: formData,  // Send the form data
                processData: false,  // Prevent jQuery from processing the data
                contentType: false,  // Prevent jQuery from setting the content type
    
                success: function (response) {
                    loadingSpinner.style.display = 'none';  // Hide the loading spinner
    
                    if (response.success) {
                        $('#changePasswordModal').modal('hide');  // Hide the modal on success
                        showNotification('Password changed successfully', 'success');  // Show success notification
                    } else {
                        showNotification('Error changing password', 'error');  // Show error notification
                    }
                },
                error: function (xhr, status, error) {
                    loadingSpinner.style.display = 'none';  // Hide the loading spinner on error
                    console.error('Error:', error);  // Log the error
                    showNotification('An error occurred while changing the password.', 'error');  // Show error notification
                }
            });
        });
    
        // Function to show notifications
        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.className = `alert alert-${type}`;
            notification.textContent = message;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        }
    });
    

    // Logout
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
                    showNotification('Logged out successfully', 'success');
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

    // Handle background image upload and default background setting
    document.getElementById('saveSettingsBtn').addEventListener('click', function () {
        const backgroundImageInput = document.getElementById('backgroundImage');
        const useCustomBackground = document.getElementById('customBackgroundToggle').checked;

        console.log('Custom Background Toggle:', useCustomBackground);

        if (!useCustomBackground) {
            // Set no background
            document.body.style.backgroundImage = 'none';
            const formData = new FormData();
            formData.append('use_default_background', 'true');

            fetch(saveBackgroundSettingsUrl, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log('Response Data:', data);
                if (data.status === 'success') {
                    $('#settingsModal').modal('hide');
                    showNotification('Background set to default successfully', 'success');
                } else {
                    showNotification('Failed to set default background.', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('An error occurred while setting the default background.', 'error');
            });
        } else if (backgroundImageInput.files.length > 0) {
            // Upload new background image
            loadingSpinner.style.display = 'block';
            const formData = new FormData();
            formData.append('background_image', backgroundImageInput.files[0]);
            formData.append('use_default_background', 'false'); // Ensure it's set to custom background

            fetch(uploadBackgroundImageUrl, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                loadingSpinner.style.display = 'none';
                console.log('Response Data:', data);
                if (data.status === 'success') {
                    document.body.style.backgroundImage = `url('${data.image_url}')`;
                    $('#settingsModal').modal('hide');
                    showNotification('Background image updated successfully', 'success');
                } else {
                    showNotification('Failed to upload background image.', 'error');
                }
            })
            .catch(error => {
                loadingSpinner.style.display = 'none';
                console.error('Error:', error);
                showNotification('An error occurred while uploading the background image.', 'error');
            });
        } else {
            // No custom background selected and no new file provided
            showNotification('Please select a custom background image or disable the custom background toggle.', 'error');
        }
    });
});






















