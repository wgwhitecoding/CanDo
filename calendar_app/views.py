from django.shortcuts import render

def index(request):
    return render(request, 'calendar_app/calendar_app.html')



