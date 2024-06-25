from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from .models import KanbanTask, Column
from .forms import KanbanTaskForm, CreateColumnForm
import json

@login_required
def kanban_board(request):
    tasks = KanbanTask.objects.filter(user=request.user)
    columns = Column.objects.filter(user=request.user)
    predefined_columns = ['New', 'To Do', 'In Progress', 'Done']

    # Check if the user has the default columns, if not, create them
    for col_name in predefined_columns:
        if not Column.objects.filter(user=request.user, name=col_name).exists():
            Column.objects.create(user=request.user, name=col_name)

    columns = Column.objects.filter(user=request.user)
    context = {
        'tasks': tasks,
        'columns': columns
    }
    return render(request, 'kanban/index.html', context)

@login_required
def create_column(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        column_name = data.get('name')
        column = Column.objects.create(user=request.user, name=column_name)
        return JsonResponse({'status': 'success', 'column_id': column.id, 'name': column.name})
    return JsonResponse({'status': 'error'})










