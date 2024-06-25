from django.shortcuts import render, redirect, get_object_or_404
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
    context = {
        'tasks': tasks,
        'columns': predefined_columns + [col.name for col in columns],
        'column_objs': columns
    }
    return render(request, 'kanban/index.html', context)

@login_required
def create_task(request):
    if request.method == 'POST':
        form = KanbanTaskForm(request.POST)
        if form.is_valid():
            task = form.save(commit=False)
            task.user = request.user
            task.column = Column.objects.get(name='New')  # Default to 'New' column
            task.save()
            return JsonResponse({'status': 'success', 'task_id': task.id, 'title': task.title, 'due_date': task.due_date})
    return JsonResponse({'status': 'error'})

@login_required
def create_column(request):
    if request.method == 'POST':
        form = CreateColumnForm(request.POST)
        if form.is_valid():
            column = form.save(commit=False)
            column.user = request.user
            column.save()
            return JsonResponse({'status': 'success', 'column_id': column.id, 'name': column.name})
    return JsonResponse({'status': 'error'})

@login_required
def edit_task(request, task_id):
    task = get_object_or_404(KanbanTask, id=task_id)
    if request.method == 'POST':
        form = KanbanTaskForm(request.POST, instance=task)
        if form.is_valid():
            form.save()
            return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error'})

@login_required
def delete_task(request, task_id):
    task = get_object_or_404(KanbanTask, id=task_id)
    task.delete()
    return JsonResponse({'status': 'success'})

@login_required
def delete_column(request, column_id):
    column = get_object_or_404(Column, id=column_id)
    column.delete()
    return JsonResponse({'status': 'success'})

@csrf_exempt
@login_required
def update_task_stage(request, task_id):
    if request.method == 'POST':
        data = json.loads(request.body)
        column_name = data.get('column')
        column = get_object_or_404(Column, name=column_name)
        task = KanbanTask.objects.get(id=task_id)
        task.column = column
        task.save()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error'})






