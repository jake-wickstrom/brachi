# Generated by Django 2.0.3 on 2018-03-29 21:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('navigation', '0004_auto_20180326_1452'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='time_l3',
            field=models.FloatField(default=999.9),
        ),
        migrations.AddField(
            model_name='player',
            name='time_l4',
            field=models.FloatField(default=999.9),
        ),
        migrations.AddField(
            model_name='player',
            name='time_l5',
            field=models.FloatField(default=999.9),
        ),
        migrations.AddField(
            model_name='player',
            name='time_l6',
            field=models.FloatField(default=999.9),
        ),
    ]
