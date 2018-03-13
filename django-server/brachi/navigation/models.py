from django.db import models

"""
Three steps to change stuff here:
1. Change your models (in models.py).
2. Run python manage.py makemigrations to create migrations for those changes
3. Run python manage.py migrate to apply those changes to the database.
"""

# TODO: don't forget to make usernames unique!
# TODO: add best times for each level
class Player(models.Model):
    name = models.CharField(max_length=100)
