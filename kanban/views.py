from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import KanbanTask, Column
from .forms import KanbanTaskForm, CreateColumnForm
import json

def kanban_board(request):
    tasks = KanbanTask.objects.filter(user=request.user)
    columns = Column.objects.filter(user=request.user)
    predefined_columns = ['New', 'To Do', 'In Progress', 'Done']
    context = {'tasks': tasks, 'columns': predefined_columns + [col.name for col in columns]}
    return render(request, 'kanban/index.html', context)

def create_task(request):
    if request.method == 'POST':
        form = KanbanTaskForm(request.POST)
        if form.is_valid():
            task = form.save(commit=False)
            task.user = request.user
            task.stage = 'New'  # Default stage
            task.save()
            return JsonResponse({'status': 'success', 'task_id': task.id, 'title': task.title, 'due_date': task.due_date})
    return JsonResponse({'status': 'error'})

def create_column(request):
    if request.method == 'POST':
        form = CreateColumnForm(request.POST)
        if form.is_valid():
            column = form.save(commit=False)
            column.user = request.user
            column.save()
            return JsonResponse({'status': 'success', 'column_id': column.id, 'name': column.name})
    return JsonResponse({'status': 'error'})

def edit_task(request, task_id):
    task = get_object_or_404(KanbanTask, id=task_id)
    if request.method == 'POST':
        form = KanbanTaskForm(request.POST, instance=task)
        if form.is_valid():
            form.save()
            return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error'})

def delete_task(request, task_id):
    task = get_object_or_404(KanbanTask, id=task_id)
    task.delete()
    return JsonResponse({'status': 'success'})

@csrf_exempt
def update_task_stage(request, task_id):
    if request.method == 'POST':
        data = json.loads(request.body)
        stage = data.get('stage')
        task = KanbanTask.objects.get(id=task_id)
        task.stage = stage
        task.save()
        return JsonResponse({'status': 'success'})





