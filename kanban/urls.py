from django.urls import path
from . import views

app_name = 'kanban'

urlpatterns = [
    path('', views.kanban_board, name='index'),
    path('create_column/', views.create_column, name='create_column'),
]


