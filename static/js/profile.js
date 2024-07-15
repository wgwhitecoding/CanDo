document.addEventListener('DOMContentLoaded', function () {
    const defaultProfileImageUrl = "https://res.cloudinary.com/dpujkdryq/image/upload/v1721073459/fggjygoiwuzrqhjwsxxq.png";

    // Set default profile image if the current profile image is not set
    const profileImageElements = document.querySelectorAll('#profileDropdown img, #profileModal img');
    profileImageElements.forEach(img => {
        if (!img.src || img.src.endsWith('avatar.png')) {
            img.src = defaultProfileImageUrl;
        }
    });

    const editProfileUrl = document.getElementById('editProfileModal').dataset.editProfileUrl;
    const changePasswordUrl = document.getElementById('changePasswordModal').dataset.changePasswordUrl;
    const deleteAccountUrl = document.getElementById('confirmDeleteModal').dataset.deleteAccountUrl;
    const logoutUrl = document.getElementById('logoutModal').dataset.logoutUrl;
    const uploadBackgroundImageUrl = '/kanban/upload_background_image/';
    const saveBackgroundSettingsUrl = '/kanban/save_background_settings/';
    const loadingSpinner = document.getElementById('loadingSpinner');

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
        const notificationContainer = document.getElementById('notificationContainer');
        if (!notificationContainer) {
            console.error('Notification container not found!');
            return;
        }

        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show`;
        notification.role = 'alert';
        notification.textContent = message;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn-close';
        button.setAttribute('data-bs-dismiss', 'alert');
        button.setAttribute('aria-label', 'Close');

        notification.appendChild(button);
        notificationContainer.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('show');
            notification.classList.add('fade');
            setTimeout(() => {
                notification.remove();
            }, 150);
        }, 3000);
    }

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
                    showNotification('Error deleting account', 'danger');
                }
            },
            error: function (xhr, status, error) {
                loadingSpinner.style.display = 'none';
                console.error('Error:', error);
                showNotification('An error occurred while deleting the account.', 'danger');
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
                        headers: {
                            'X-CSRFToken': getCookie('csrftoken')
                        },
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
                                showNotification('Error updating profile', 'danger');
                            }
                        },
                        error: function (xhr, status, error) {
                            loadingSpinner.style.display = 'none';
                            console.error('Error:', error);
                            showNotification('An error occurred while updating the profile.', 'danger');
                        }
                    });
                },
                error(err) {
                    loadingSpinner.style.display = 'none';
                    console.error('Error:', err);
                    showNotification('An error occurred while compressing the image.', 'danger');
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
                        document.querySelector('#profileModal img').src = response.profile_picture_url;
                        document.querySelector('#profileDropdown img').src = response.profile_picture_url;
                        document.querySelector('#profileModal h3').textContent = response.user_name;
                        document.querySelector('#profileModal p.email').textContent = 'Email: ' + response.user_email;
                        document.querySelector('#profileModal p.bio').textContent = 'Bio: ' + response.user_bio;
                        $('#editProfileModal').modal('hide');
                        showNotification('Profile updated successfully', 'success');
                    } else {
                        showNotification('Error updating profile', 'danger');
                    }
                },
                error: function (xhr, status, error) {
                    loadingSpinner.style.display = 'none';
                    console.error('Error:', error);
                    showNotification('An error occurred while updating the profile.', 'danger');
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
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            success: function (response) {
                loadingSpinner.style.display = 'none';
                if (response.success) {
                    $('#changePasswordModal').modal('hide');
                    showNotification('Password changed successfully', 'success');
                } else {
                    showNotification('Error changing password', 'danger');
                }
            },
            error: function (xhr, status, error) {
                loadingSpinner.style.display = 'none';
                console.error('Error:', error);
                showNotification('An error occurred while changing the password.', 'danger');
            }
        });
    });

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
                    showNotification('Error logging out', 'danger');
                }
            },
            error: function (xhr, status, error) {
                loadingSpinner.style.display = 'none';
                console.error('Error:', error);
                showNotification('An error occurred while logging out.', 'danger');
            }
        });
    });

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
                    showNotification('Failed to set default background.', 'danger');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('An error occurred while setting the default background.', 'danger');
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
                    showNotification('Failed to upload background image.', 'danger');
                }
            })
            .catch(error => {
                loadingSpinner.style.display = 'none';
                console.error('Error:', error);
                showNotification('An error occurred while uploading the background image.', 'danger');
            });
        } else {
            showNotification('Please select a custom background image or disable the custom background toggle.', 'danger');
        }
    });
});






















