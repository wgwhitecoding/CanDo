from django.shortcuts import render, redirect
from allauth.account.views import SignupView
from allauth.account.forms import SignupForm

def index(request):
    return render(request, 'kanban/index.html')

class CustomSignupView(SignupView):
    template_name = 'account/signup.html'
    form_class = SignupForm

    def form_valid(self, form):
        user = form.save(self.request)
        return redirect('kanban:index')


