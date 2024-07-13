from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import Profile, KanbanTask, Column, Board, SearchHistory

class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False

class CustomUserAdmin(UserAdmin):
    inlines = (ProfileInline,)

    def delete_model(self, request, obj):
        try:
            obj.profile.delete()
        except Profile.DoesNotExist:
            pass
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        for user in queryset:
            try:
                user.profile.delete()
            except Profile.DoesNotExist:
                pass
        super().delete_queryset(request, queryset)

admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)
admin.site.register(KanbanTask)
admin.site.register(Column)
admin.site.register(Board)
admin.site.register(SearchHistory)







