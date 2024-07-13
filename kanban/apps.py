from django.apps import AppConfig

class KanbanConfig(AppConfig):
    name = 'kanban'
    verbose_name = 'Kanban'

    def ready(self):
        import kanban.signals







