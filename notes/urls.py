from django.urls import path
from . import views

urlpatterns = [
    path('', views.notes_view, name='notes_view'),
]
