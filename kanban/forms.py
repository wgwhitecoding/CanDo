from django import forms
from .models import KanbanTask, Column

class KanbanTaskForm(forms.ModelForm):
    class Meta:
        model = KanbanTask
        fields = ['title', 'description', 'due_date', 'priority', 'column']

class ColumnForm(forms.ModelForm):
    class Meta:
        model = Column
        fields = ['name']










