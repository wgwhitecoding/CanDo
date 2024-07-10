from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
from django.contrib import messages
from .models import KanbanTask, Column, Board, SearchHistory, Attachment, Profile
from .forms import KanbanTaskForm, ColumnForm, AttachmentForm, UserForm, ProfileForm
import json

@login_required
def index(request):
    return redirect('kanban:board')

@login_required
def search_tasks(request):
    query = request.GET.get('q')
    tasks = KanbanTask.objects.filter(title__icontains=query, created_by=request.user) if query else KanbanTask.objects.none()

    if query:
        for task in tasks:
            if not SearchHistory.objects.filter(user=request.user, task=task).exists():
                SearchHistory.objects.create(user=request.user, task=task, query=query)

    search_history = SearchHistory.objects.filter(user=request.user).order_by('-timestamp')[:10]

    return render(request, 'kanban/search_results.html', {
        'tasks': tasks,
        'task_form': KanbanTaskForm(),
        'search_history': search_history
    })

@login_required
@csrf_exempt
def clear_search_history(request):
    if request.method == 'POST':
        SearchHistory.objects.filter(user=request.user).delete()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@login_required
def kanban_board(request):
    predefined_columns = ['New', 'To Do']
    board, created = Board.objects.get_or_create(owner=request.user, name='Default Board')
    columns = Column.objects.filter(board=board)

    columns.filter(name__in=['In Progress', 'Done']).delete()

    for col_name in predefined_columns:
        if not columns.filter(name=col_name).exists():
            Column.objects.create(name=col_name, board=board, default=True)

    columns = Column.objects.filter(board=board).order_by('id')
    tasks = KanbanTask.objects.filter(created_by=request.user).order_by('position')
    for task in tasks:
        task.attachments_with_type = task.attachments.all()

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
        form = KanbanTaskForm(request.POST, request.FILES)
        if form.is_valid():
            task = form.save(commit=False)
            task.created_by = request.user
            task.column = Column.objects.get(name='New', board__owner=request.user)
            task.position = KanbanTask.objects.filter(column=task.column).count() + 1
            task.save()

            files = request.FILES.getlist('attachments')
            for file in files:
                Attachment.objects.create(task=task, file=file)

            messages.success(request, 'Task created successfully.')
            return JsonResponse({'status': 'success', 'task': {'id': task.id, 'title': task.title, 'description': task.description, 'due_date': str(task.due_date), 'priority': task.priority}})
        else:
            return JsonResponse({'status': 'error', 'errors': form.errors})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@login_required
@csrf_exempt
def edit_task(request, task_id):
    task = get_object_or_404(KanbanTask, id=task_id, created_by=request.user)
    if request.method == 'POST':
        form = KanbanTaskForm(request.POST, request.FILES, instance=task)
        if form.is_valid():
            task = form.save()

            files = request.FILES.getlist('attachments')
            for file in files:
                Attachment.objects.create(task=task, file=file)

            messages.success(request, 'Task edited successfully.')
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
        messages.success(request, 'Task deleted successfully.')
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
            messages.success(request, 'Column created successfully.')
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
            messages.success(request, 'Column edited successfully.')
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
        messages.success(request, 'Column deleted successfully.')
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@login_required
@csrf_exempt
def move_task(request, task_id):
    if request.method == 'POST':
        task = get_object_or_404(KanbanTask, id=task_id, created_by=request.user)
        data = json.loads(request.body)
        new_column = get_object_or_404(Column, id=data['column_id'], board__owner=request.user)
        new_position = data['position']

        old_column = task.column
        if old_column != new_column:
            old_tasks = KanbanTask.objects.filter(column=old_column).exclude(id=task.id).order_by('position')
            for i, t in enumerate(old_tasks):
                t.position = i + 1
                t.save()

        new_tasks = list(KanbanTask.objects.filter(column=new_column).exclude(id=task.id).order_by('position'))
        new_tasks.insert(new_position - 1, task)

        for i, t in enumerate(new_tasks):
            t.position = i + 1
            t.save()

        task.column = new_column
        task.position = new_position
        task.save()

        messages.success(request, 'Task moved successfully.')
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@login_required
@csrf_exempt
def get_task(request, task_id):
    task = get_object_or_404(KanbanTask, id=task_id, created_by=request.user)
    attachments = [{'id': attachment.id, 'url': attachment.file.url, 'name': attachment.file.name} for attachment in task.attachments.all()]
    return JsonResponse({
        'title': task.title,
        'description': task.description,
        'due_date': task.due_date,
        'priority': task.priority,
        'column': task.column.id,
        'attachments': attachments
    })

@login_required
@csrf_exempt
def get_column(request, column_id):
    column = get_object_or_404(Column, id=column_id, board__owner=request.user)
    return JsonResponse({'name': column.name})

@login_required
def get_tasks_in_column(request, column_id):
    column = get_object_or_404(Column, id=column_id, board__owner=request.user)
    tasks = KanbanTask.objects.filter(column=column).order_by('position')
    tasks_data = list(tasks.values('id', 'title', 'description', 'due_date', 'priority', 'position'))
    return JsonResponse(tasks_data, safe=False)

@login_required
@csrf_exempt
def remove_attachment(request, attachment_id):
    if request.method == 'POST':
        try:
            attachment = Attachment.objects.get(id=attachment_id)
            attachment.delete()
            return JsonResponse({'status': 'success'})
        except Attachment.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Attachment not found'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@login_required
def edit_profile(request):
    user = request.user
    profile, created = Profile.objects.get_or_create(user=user)

    if request.method == 'POST':
        user_form = UserForm(request.POST, instance=user)
        profile_form = ProfileForm(request.POST, request.FILES, instance=profile)

        if user_form.is_valid() and profile_form.is_valid():
            user_form.save()
            profile_form.save()
            messages.success(request, 'Your profile was successfully updated!')
            return JsonResponse({
                'success': True,
                'profile_picture_url': profile.profile_image.url,
                'user_name': f'{user.first_name} {user.last_name}',
                'user_email': user.email,
                'user_bio': profile.bio
            })
        else:
            errors = json.loads(user_form.errors.as_json()) + json.loads(profile_form.errors.as_json())
            return JsonResponse({'success': False, 'errors': errors})

    user_form = UserForm(instance=user)
    profile_form = ProfileForm(instance=profile)

    return render(request, 'kanban/edit_profile.html', {
        'user_form': user_form,
        'profile_form': profile_form
    })

@login_required
@csrf_exempt
def edit_profile_api(request):
    if request.method == 'POST':
        user = request.user
        profile, created = Profile.objects.get_or_create(user=user)

        user_form = UserForm(request.POST, instance=user)
        profile_form = ProfileForm(request.POST, request.FILES, instance=profile)

        if user_form.is_valid() and profile_form.is_valid():
            user_form.save()
            profile_form.save()
            return JsonResponse({
                'success': True,
                'profile_picture_url': profile.profile_image.url,
                'user_name': f'{user.first_name} {user.last_name}',
                'user_email': user.email,
                'user_bio': profile.bio
            })
        else:
            errors = json.loads(user_form.errors.as_json()) + json.loads(profile_form.errors.as_json())
            return JsonResponse({'success': False, 'errors': errors})

    return JsonResponse({'success': False, 'message': 'Invalid request method'})

@login_required
@csrf_exempt
def delete_account(request):
    if request.method == 'POST':
        try:
            user = request.user
            user.delete()
            return JsonResponse({'success': True, 'redirect_url': '/accounts/login/'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'message': 'Invalid request method'})

@login_required
@csrf_exempt
def logout_user(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({'success': True, 'redirect_url': '/accounts/login/'})
    return JsonResponse({'success': False, 'message': 'Invalid request method'})






































