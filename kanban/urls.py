from django.urls import path
from . import views

app_name = 'kanban'

urlpatterns = [
    path('', views.index, name='index'),
    path('board/', views.kanban_board, name='board'),
    path('create_task/', views.create_task, name='create_task'),
    path('edit_task/<int:task_id>/', views.edit_task, name='edit_task'),
    path('delete_task/<int:task_id>/', views.delete_task, name='delete_task'),
    path('create_column/', views.create_column, name='create_column'),
    path('edit_column/<int:column_id>/', views.edit_column, name='edit_column'),
    path('delete_column/<int:column_id>/', views.delete_column, name='delete_column'),
    path('move_task/<int:task_id>/', views.move_task, name='move_task'),
    path('get_task/<int:task_id>/', views.get_task, name='get_task'),
    path('get_column/<int:column_id>/', views.get_column, name='get_column'),
    path('search/', views.search_tasks, name='search_tasks'),
    path('get_tasks_in_column/<int:column_id>/', views.get_tasks_in_column, name='get_tasks_in_column'),
    path('clear_search_history/', views.clear_search_history, name='clear_search_history'),
    path('remove_attachment/<int:attachment_id>/', views.remove_attachment, name='remove_attachment'),
    path('edit_profile/', views.edit_profile, name='edit_profile'),
    path('edit_profile_api/', views.edit_profile_api, name='edit_profile_api'),
    path('delete_account/', views.delete_account, name='delete_account'),
]















