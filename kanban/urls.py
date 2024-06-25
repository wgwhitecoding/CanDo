from django.urls import path
from . import views

app_name = 'kanban'

urlpatterns = [
    path('', views.kanban_board, name='index'),
    path('create_column/', views.create_column, name='create_column'),
    path('edit_column/<int:column_id>/', views.edit_column, name='edit_column'),
    path('delete_column/<int:column_id>/', views.delete_column, name='delete_column'),
    # Other paths remain unchanged
]


