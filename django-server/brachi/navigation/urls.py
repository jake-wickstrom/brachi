from django.urls import path
from navigation.models import Player
from . import views

# levels share a url, views.play handles which level is shown
urlpatterns = [
    path('title', views.title, name='title'),
    path('title/login', views.login, name='login'),
    path('level-select', views.level_select, name='level-select'),
    path('leaderboard', views.leaderboard, name='leaderboard'),
    path('play', views.play, name='play'),
    path('project', views.project, name='project'),
]

"""
Putting code here will cause it to run only once when the command:
 >python manage.py runserver
is called. Can be used to initiallize the database.
"""
existing_names = Player.objects.values_list('name', flat=True)
# TODO: update to fastest possible times given by algorithm
if 'Sonic the Hedgehog' not in existing_names:
    sonic = Player(name='Sonic the Hedgehog', time_l1=1.24, time_l2=2.15, time_l3=1.76)
    sonic.save()
