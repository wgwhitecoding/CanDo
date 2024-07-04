from django.contrib import admin
from .models import KanbanTask, Column, Board, SearchHistory  

admin.site.register(KanbanTask)
admin.site.register(Column)
admin.site.register(Board)
admin.site.register(SearchHistory)  

