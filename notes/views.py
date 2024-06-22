from django.shortcuts import render

def notes_view(request):
    return render(request, 'notes/notes.html')
