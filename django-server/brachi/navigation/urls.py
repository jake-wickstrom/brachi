from django.urls import path
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
