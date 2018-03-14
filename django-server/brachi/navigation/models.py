from django.db import models

"""
Three steps to change stuff here:
1. Change your models (in models.py).
2. Run python manage.py makemigrations to create migrations for those changes.
3. Run python manage.py migrate to apply those changes to the database.

To clear the current database on your machine:
 >python manage.py flush
"""

# TODO: add best times for correct numeber of levels
class Player(models.Model):
    name = models.CharField(max_length=21)
    time_l1 = models.FloatField(default=999.9)
    time_l2 = models.FloatField(default=999.9)
    time_l3 = models.FloatField(default=999.9)
