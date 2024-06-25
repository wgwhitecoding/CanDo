from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from .models import KanbanTask, Column
from .forms import KanbanTaskForm, CreateColumnForm
import json

@login_required
def kanban_board(request):
    predefined_columns = ['New', 'To Do', 'In Progress', 'Done']
    columns = Column.objects.filter(user=request.user)
    for col_name in predefined_columns:
        if not columns.filter(name=col_name).exists():
            Column.objects.create(name=col_name, user=request.user)
    columns = Column.objects.filter(user=request.user)
    tasks = KanbanTask.objects.filter(user=request.user)
    context = {
        'tasks': tasks,
        'columns': columns,
    }
    return render(request, 'kanban/index.html', context)

@login_required
def create_column(request):
    if request.method == 'POST':
        form = CreateColumnForm(request.POST)
        if form.is_valid():
            column = form.save(commit=False)
            column.user = request.user
            column.save()
            return JsonResponse({'status': 'success', 'column_id': column.id, 'name': column.name})
        else:
            print("Form is not valid:", form.errors)
    print("Request method is not POST or form is not valid")
    return JsonResponse({'status': 'error'})

@login_required
def edit_column(request, column_id):
    column = get_object_or_404(Column, id=column_id, user=request.user)
    if request.method == 'POST':
        new_name = request.POST.get('name')
        column.name = new_name
        column.save()
        return JsonResponse({'status': 'success', 'name': new_name})
    print("Request method is not POST")
    return JsonResponse({'status': 'error'})


@login_required
def delete_column(request, column_id):
    column = get_object_or_404(Column, id=column_id, user=request.user)
    column.delete()
    return JsonResponse({'status': 'success'})













