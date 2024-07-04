from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from .models import KanbanTask, Column, Board, SearchHistory
from .forms import KanbanTaskForm, ColumnForm
import json

@login_required
def index(request):
    return redirect('kanban:board')

@login_required
def search_tasks(request):
    query = request.GET.get('q')
    tasks = KanbanTask.objects.filter(title__icontains=query, created_by=request.user) if query else KanbanTask.objects.none()
    
    if query:
        if not SearchHistory.objects.filter(user=request.user, query=query).exists():
            SearchHistory.objects.create(user=request.user, query=query)
    
    search_history = SearchHistory.objects.filter(user=request.user).order_by('-timestamp')[:10]

    return render(request, 'kanban/search_results.html', {
        'tasks': tasks,
        'task_form': KanbanTaskForm(),
        'search_history': search_history
    })

@login_required
def kanban_board(request):
    predefined_columns = ['New', 'To Do', 'In Progress', 'Done']
    board, created = Board.objects.get_or_create(owner=request.user, name='Default Board')
    columns = Column.objects.filter(board=board)
    for col_name in predefined_columns:
        if not columns.filter(name=col_name).exists():
            Column.objects.create(name=col_name, board=board, default=True)
    columns = Column.objects.filter(board=board)
    tasks = KanbanTask.objects.filter(created_by=request.user)
    task_form = KanbanTaskForm()
    column_form = ColumnForm()
    context = {
        'tasks': tasks,
        'columns': columns,
        'task_form': task_form,
        'column_form': column_form,
    }
    return render(request, 'kanban/index.html', context)

@login_required
@csrf_exempt
def create_task(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        form = KanbanTaskForm(data)
        if form.is_valid():
            task = form.save(commit=False)
            task.created_by = request.user
            task.column = Column.objects.get(name='New', board__owner=request.user)
            task.save()
            return JsonResponse({'status': 'success'})
        else:
            return JsonResponse({'status': 'error', 'errors': form.errors})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@login_required
@csrf_exempt
def edit_task(request, task_id):
    task = get_object_or_404(KanbanTask, id=task_id, created_by=request.user)
    if request.method == 'POST':
        data = json.loads(request.body)
        form = KanbanTaskForm(data, instance=task)
        if form.is_valid():
            form.save()
            return JsonResponse({'status': 'success'})
        else:
            return JsonResponse({'status': 'error', 'errors': form.errors})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@login_required
@csrf_exempt
def delete_task(request, task_id):
    task = get_object_or_404(KanbanTask, id=task_id, created_by=request.user)
    if request.method == 'POST':
        task.delete()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@login_required
@csrf_exempt
def create_column(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        form = ColumnForm(data)
        if form.is_valid():
            column = form.save(commit=False)
            column.board = Board.objects.get(owner=request.user, name='Default Board')
            column.save()
            return JsonResponse({'status': 'success', 'column_id': column.id, 'name': column.name})
        else:
            return JsonResponse({'status': 'error', 'errors': form.errors})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@login_required
@csrf_exempt
def edit_column(request, column_id):
    column = get_object_or_404(Column, id=column_id, board__owner=request.user, default=False)
    if request.method == 'POST':
        data = json.loads(request.body)
        form = ColumnForm(data, instance=column)
        if form.is_valid():
            form.save()
            return JsonResponse({'status': 'success', 'name': column.name})
        else:
            return JsonResponse({'status': 'error', 'errors': form.errors})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@login_required
@csrf_exempt
def delete_column(request, column_id):
    column = get_object_or_404(Column, id=column_id, board__owner=request.user, default=False)
    tasks = KanbanTask.objects.filter(column=column)
    if tasks.exists():
        return JsonResponse({'status': 'error', 'message': 'Please move or delete tasks in the column first.'})
    if request.method == 'POST':
        column.delete()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@login_required
@csrf_exempt
def move_task(request, task_id):
    if request.method == 'POST':
        task = get_object_or_404(KanbanTask, id=task_id, created_by=request.user)
        data = json.loads(request.body)
        new_column = get_object_or_404(Column, id=data['column_id'], board__owner=request.user)
        task.column = new_column
        task.save()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@login_required
@csrf_exempt
def get_task(request, task_id):
    task = get_object_or_404(KanbanTask, id=task_id, created_by=request.user)
    return JsonResponse({
        'title': task.title,
        'description': task.description,
        'due_date': task.due_date,
        'priority': task.priority,
        'column': task.column.id
    })

@login_required
@csrf_exempt
def get_column(request, column_id):
    column = get_object_or_404(Column, id=column_id, board__owner=request.user)
    return JsonResponse({'name': column.name})

@login_required
def get_tasks_in_column(request, column_id):
    column = get_object_or_404(Column, id=column_id, board__owner=request.user)
    tasks = KanbanTask.objects.filter(column=column)
    tasks_data = list(tasks.values('id', 'title', 'description', 'due_date', 'priority'))
    return JsonResponse(tasks_data, safe=False)






























