# Generated by Django 2.0.3 on 2018-03-26 21:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('navigation', '0003_auto_20180314_1114'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='player',
            name='time_l3',
        ),
        migrations.AddField(
            model_name='player',
            name='time_l0',
            field=models.FloatField(default=999.9),
        ),
    ]
