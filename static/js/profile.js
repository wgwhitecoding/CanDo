document.addEventListener('DOMContentLoaded', function () {
    const editProfileUrl = document.getElementById('editProfileModal').dataset.editProfileUrl;
    const changePasswordUrl = document.getElementById('changePasswordModal').dataset.changePasswordUrl;
    const deleteAccountUrl = document.getElementById('confirmDeleteModal').dataset.deleteAccountUrl;
    const logoutUrl = document.getElementById('logoutModal').dataset.logoutUrl;
    const loginUrl = "{% url 'account_login' %}";

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
                    alert('Error deleting account');
                }
            },
            error: function (xhr, status, error) {
                loadingSpinner.style.display = 'none';
                console.error('Error:', error);
                alert('An error occurred while deleting the account.');
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
                                alert('Profile updated successfully');
                            } else {
                                alert('Error updating profile');
                            }
                        },
                        error: function (xhr, status, error) {
                            loadingSpinner.style.display = 'none';
                            console.error('Error:', error);
                            alert('An error occurred while updating the profile.');
                        }
                    });
                },
                error(err) {
                    loadingSpinner.style.display = 'none';
                    console.error('Error:', err);
                    alert('An error occurred while compressing the image.');
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
                        alert('Profile updated successfully');
                    } else {
                        alert('Error updating profile');
                    }
                },
                error: function (xhr, status, error) {
                    loadingSpinner.style.display = 'none';
                    console.error('Error:', error);
                    alert('An error occurred while updating the profile.');
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
                    alert('Password changed successfully');
                } else {
                    alert('Error changing password');
                }
            },
            error: function (xhr, status, error) {
                loadingSpinner.style.display = 'none';
                console.error('Error:', error);
                alert('An error occurred while changing the password.');
            }
        });
    });

    document.getElementById('confirmLogoutBtn').addEventListener('click', function () {
        $.ajax({
            url: logoutUrl,
            type: "POST",
            data: {
                csrfmiddlewaretoken: document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            success: function (response) {
                if (response.success) {
                    window.location.href = response.redirect_url;
                } else {
                    alert('Error logging out');
                }
            },
            error: function (xhr, status, error) {
                console.error('Error:', error);
                alert('An error occurred while logging out.');
            }
        });
    });
});

















