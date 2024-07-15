import tempfile
import os
from pdf2image import convert_from_path
from cloudinary.uploader import upload
from cloudinary.utils import cloudinary_url

def pdf_to_images(pdf_file):
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_pdf:
        temp_pdf.write(pdf_file.read())
        temp_pdf.flush()
        images = convert_from_path(temp_pdf.name)

    uploaded_images = []
    for image in images:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_img:
            image.save(temp_img.name, 'PNG')
            response = upload(temp_img.name, folder='pdf_images')
            uploaded_images.append(response['url'])

            os.unlink(temp_img.name)
    os.unlink(temp_pdf.name)

    return uploaded_images



