# Generated by Django 4.0.4 on 2022-05-16 20:23

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('kitchen', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='food',
            old_name='foto',
            new_name='photo',
        ),
    ]