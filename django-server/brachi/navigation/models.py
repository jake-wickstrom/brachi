from django.db import models

"""
Three steps to change stuff here:
1. Change your models (in models.py).
2. Run python manage.py makemigrations to create migrations for those changes.
3. Run python manage.py migrate to apply those changes to the database.

To clear the current database on your machine:
 > python manage.py flush
"""

# TODO: add slots for times for correct number of levels
class Player(models.Model):
    name = models.CharField(max_length=21)
    time_l0 = models.FloatField(default=999.9)
    solution_seen_l0 = models.BooleanField(default=False)
    time_l1 = models.FloatField(default=999.9)
    solution_seen_l1 = models.BooleanField(default=False)
    time_l2 = models.FloatField(default=999.9)
    solution_seen_l2 = models.BooleanField(default=False)
    time_l3 = models.FloatField(default=999.9)
    solution_seen_l3 = models.BooleanField(default=False)
    time_l4 = models.FloatField(default=999.9)
    solution_seen_l4 = models.BooleanField(default=False)
    time_l5 = models.FloatField(default=999.9)
    solution_seen_l5 = models.BooleanField(default=False)
    time_l6 = models.FloatField(default=999.9)
    solution_seen_l6 = models.BooleanField(default=False)
