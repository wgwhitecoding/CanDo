from django.urls import path
from . import views

app_name = 'kanban'
urlpatterns = [
    path('', views.kanban_board, name='index'),
    path('create_task/', views.create_task, name='create_task'),
    path('create_column/', views.create_column, name='create_column'),
    path('edit_task/<int:task_id>/', views.edit_task, name='edit_task'),
    path('delete_task/<int:task_id>/', views.delete_task, name='delete_task'),
    path('update_task_stage/<int:task_id>/', views.update_task_stage, name='update_task_stage'),
]


