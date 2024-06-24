from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.user.username

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name

class Project(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class KanbanTask(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, null=True, blank=True, on_delete=models.SET_NULL)
    project = models.ForeignKey(Project, null=True, blank=True, on_delete=models.SET_NULL)
    title = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)
    priority = models.CharField(max_length=10, null=True, blank=True)
    completed = models.BooleanField(default=False)
    recurring_interval = models.CharField(max_length=50, null=True, blank=True)
    stage = models.CharField(max_length=50)  # New, To Do, In Progress, Done

    def __str__(self):
        return self.title

class Column(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Tag(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class KanbanTaskTags(models.Model):
    kanban_task = models.ForeignKey(KanbanTask, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)

class Attachment(models.Model):
    kanban_task = models.ForeignKey(KanbanTask, on_delete=models.CASCADE)
    file_path = models.CharField(max_length=255)

class Subtask(models.Model):
    kanban_task = models.ForeignKey(KanbanTask, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    description = models.TextField()
    completed = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class Comment(models.Model):
    kanban_task = models.ForeignKey(KanbanTask, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Comment by {self.user.username}'

class Reminder(models.Model):
    kanban_task = models.ForeignKey(KanbanTask, on_delete=models.CASCADE)
    reminder_time = models.DateTimeField()

class ActivityLog(models.Model):
    kanban_task = models.ForeignKey(KanbanTask, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    activity = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

class Collaborator(models.Model):
    kanban_task = models.ForeignKey(KanbanTask, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

class SharedList(models.Model):
    list_name = models.CharField(max_length=100)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.list_name

class SharedListKanbanTasks(models.Model):
    shared_list = models.ForeignKey(SharedList, on_delete=models.CASCADE)
    kanban_task = models.ForeignKey(KanbanTask, on_delete=models.CASCADE)

class UserPreference(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    preference_key = models.CharField(max_length=100)
    preference_value = models.CharField(max_length=255)

class UserTheme(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    theme_name = models.CharField(max_length=100)
    primary_color = models.CharField(max_length=7)
    secondary_color = models.CharField(max_length=7)

class Note(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    kanban_task = models.ForeignKey(KanbanTask, null=True, blank=True, on_delete=models.SET_NULL)
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


