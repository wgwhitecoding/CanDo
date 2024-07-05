# Generated by Django 5.0.6 on 2024-07-04 16:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('kanban', '0003_searchhistory_task'),
    ]

    operations = [
        migrations.AlterField(
            model_name='kanbantask',
            name='priority',
            field=models.CharField(choices=[('Low', 'Low'), ('Medium', 'Medium'), ('High', 'High'), ('Done', 'Done')], default='Medium', max_length=20),
        ),
    ]