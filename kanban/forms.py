from django import forms
from django.contrib.auth.models import User
from .models import Profile, KanbanTask, Column, Attachment
from django.contrib.auth.forms import PasswordChangeForm


class UserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email']


class ProfileForm(forms.ModelForm):
    bio = forms.CharField(widget=forms.Textarea, required=False)

    class Meta:
        model = Profile
        fields = ['profile_image', 'bio']


class KanbanTaskForm(forms.ModelForm):
    class Meta:
        model = KanbanTask
        fields = ['title', 'description', 'due_date', 'priority']
        widgets = {
            'due_date':
            forms.DateInput(attrs={'class': 'form-control datepicker'}),
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
















