from django.urls import re_path
from navigation.models import Player
from . import views

# levels share a url, views.play handles which level is shown
urlpatterns = [
    re_path(r'^title/?$', views.title, name='title'),
    re_path(r'^title/login/?$', views.login, name='login'),
    re_path(r'^level-select/?$', views.level_select, name='level-select'),
    re_path(r'^leaderboard/?$', views.leaderboard, name='leaderboard'),
    re_path(r'^play/?$', views.play, name='play'),
    re_path(r'^play/submit/?$', views.play_submit, name='play_submit'),
    re_path(r'^project/?$', views.project, name='project'),
]

"""
Putting code here will cause it to run only once when the command:
 > python manage.py runserver
is called. Can be used to initiallize the database.
"""

existing_names = Player.objects.values_list('name', flat=True)
# TODO: update to fastest possible (or something) times given by algorithm
if 'Sonic the Hedgehog' not in existing_names:
    sonic = Player(name='Sonic the Hedgehog', time_l0=2.0, time_l1=2.0, time_l2=2.0, time_l3=2.0, time_l4=2.0, time_l5=2.0, time_l6=2.0)
    sonic.save()
if 'Daymon' not in existing_names:
    daymon = Player(name='Daymon', time_l0=1.0, time_l1=1.0, time_l2=1.0, time_l3=1.0, time_l4=1.0, time_l5=1.0, time_l6=1.0)
    daymon.save()
