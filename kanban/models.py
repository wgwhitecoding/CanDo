from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_image = models.ImageField(upload_to='profile_images/', default='profile_images/default.png')
    bio = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.user.username

class Board(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Column(models.Model):
    board = models.ForeignKey(Board, related_name='columns', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    default = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class KanbanTask(models.Model):
    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Done', 'Done'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    due_date = models.DateField(null=True, blank=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    column = models.ForeignKey(Column, related_name='tasks', on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    position = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['position']

class Attachment(models.Model):
    task = models.ForeignKey(KanbanTask, related_name='attachments', on_delete=models.CASCADE)
    file = models.FileField(upload_to='attachments/')

    def __str__(self):
        return self.file.name

    @property
    def is_pdf(self):
        return self.file.name.lower().endswith('.pdf')

class SearchHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    query = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    task = models.ForeignKey(KanbanTask, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return self.query



















