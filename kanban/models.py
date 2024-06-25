

from django.db import models
from django.contrib.auth.models import User

class Column(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

class KanbanTask(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    due_date = models.DateField(null=True, blank=True)
    column = models.ForeignKey(Column, related_name='tasks', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

