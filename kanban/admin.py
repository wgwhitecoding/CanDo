from django.contrib import admin
from .models import Board, Column, KanbanTask

admin.site.register(Board)
admin.site.register(Column)
admin.site.register(KanbanTask)
