from django import forms
from .models import KanbanTask, Column, Attachment

class KanbanTaskForm(forms.ModelForm):
    class Meta:
        model = KanbanTask
        fields = ['title', 'description', 'due_date', 'priority']
        widgets = {
            'due_date': forms.DateInput(attrs={'class': 'form-control datepicker'}),
        }

class ColumnForm(forms.ModelForm):
    class Meta:
        model = Column
        fields = ['name']

class AttachmentForm(forms.ModelForm):
    class Meta:
        model = Attachment
        fields = ['file']
        widgets = {
            'file': forms.FileInput(attrs={'multiple': False})
        }













