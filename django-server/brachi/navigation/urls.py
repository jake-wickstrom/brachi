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
    re_path(r'^play/solution/?$', views.play_solution, name='play_solution'),
    re_path(r'^project/?$', views.project, name='project'),
]
