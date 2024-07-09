// Function to handle file previews
function handleFilePreview() {
    const fileInput = document.getElementById('attachments');
    const filePreviewContainer = document.getElementById('file-preview');

    fileInput.addEventListener('change', (event) => {
        filePreviewContainer.innerHTML = ''; // Clear previous previews

        Array.from(event.target.files).forEach(file => {
            const fileDiv = document.createElement('div');
            fileDiv.classList.add('attachment');

            if (file.type === 'application/pdf') {
                const pdfLink = document.createElement('a');
                pdfLink.href = URL.createObjectURL(file);
                pdfLink.target = '_blank';

                const pdfImg = document.createElement('img');
                pdfImg.src = '/static/images/pdf-icon.png'; // Ensure this path is correct
                pdfImg.alt = 'PDF';
                pdfImg.classList.add('attachment-thumbnail');

                pdfLink.appendChild(pdfImg);

                const fileNameSpan = document.createElement('span');
                fileNameSpan.textContent = file.name.length > 20 ? file.name.slice(0, 17) + '...' : file.name;

                fileDiv.appendChild(pdfLink);
                fileDiv.appendChild(fileNameSpan);
            } else {
                const imgLink = document.createElement('a');
                imgLink.href = URL.createObjectURL(file);
                imgLink.target = '_blank';

                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.alt = 'Attachment';
                img.classList.add('attachment-thumbnail');

                imgLink.appendChild(img);
                fileDiv.appendChild(imgLink);
            }

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.classList.add('btn', 'btn-danger', 'remove-attachment-btn');
            removeBtn.textContent = '×';
            removeBtn.addEventListener('click', () => {
                fileDiv.remove();
            });

            fileDiv.appendChild(removeBtn);
            filePreviewContainer.appendChild(fileDiv);
        });
    });
}

document.addEventListener('DOMContentLoaded', handleFilePreview);


