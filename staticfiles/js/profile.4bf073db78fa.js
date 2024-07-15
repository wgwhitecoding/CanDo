document.addEventListener('DOMContentLoaded', function () {
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
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Delete Account
    document.getElementById('confirmDeleteAccountBtn').addEventListener('click', function () {
        loadingSpinner.style.display = 'block';
        $.ajax({
            url: deleteAccountUrl,
            type: "POST",
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
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
                        headers: {
                            'X-CSRFToken': getCookie('csrftoken')
                        },
                        success: function (response) {
                            loadingSpinner.style.display = 'none';
                            if (response.success) {
                                updateProfileImage(response.profile_picture_url);
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
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                },
                success: function (response) {
                    loadingSpinner.style.display = 'none';
                    if (response.success) {
                        updateProfileImage(response.profile_picture_url);
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

    // Function to update profile image
    function updateProfileImage(url) {
        const avatarImgElements = document.querySelectorAll('img.navbar-avatar, img.profile-avatar');
        avatarImgElements.forEach(img => {
            if (url && url !== 'profile_images/default.png') {
                img.src = url;
            } else {
                img.src = '/static/images/avatar.png';
            }
        });
    }

    // Change Password
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
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
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

    // Logout
    document.getElementById('confirmLogoutBtn').addEventListener('click', function () {
        loadingSpinner.style.display = 'block';
        $.ajax({
            url: logoutUrl,
            type: "POST",
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
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

        if (!useCustomBackground) {
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
            loadingSpinner.style.display = 'block';
            const formData = new FormData();
            formData.append('background_image', backgroundImageInput.files[0]);
            formData.append('use_default_background', 'false');

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
            showNotification('Please select a custom background image or disable the custom background toggle.', 'error');
        }
    });
});























