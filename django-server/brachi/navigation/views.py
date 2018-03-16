from django.shortcuts import render
from navigation.models import Player
from navigation.static import *

def checkValidSession(request):
    if 'username' in request.session:
        if request.session['username'] in Player.objects.values_list('name', flat=True):
            return True
    return False

def title(request, invalid_name=False):
    context = {}
    context['invalid_name'] = invalid_name
    return render(request, 'navigation/title.html', context)

def login(request):
    if request.method == 'GET':
        try:
            name = request.GET['name']
            existing_names = Player.objects.values_list('name', flat=True)
            if name not in existing_names and name != "":
                new_player = Player(name=name)
                new_player.save()
                request.session['username'] = name
                return level_select(request)
        except:
            pass # must be an invalid input, just let the return below catch it
    # if anything above fails, come here
    return title(request, invalid_name=True)

def level_select(request):
    if checkValidSession(request) == False:
        return title(request)
    context = {}
    context['levels'] = ALL_LEVELS
    return render(request, 'navigation/level_select.html', context)

def leaderboard(request):
    if checkValidSession(request) == False:
        return title(request)
    context = {}
    context['levels'] = ALL_LEVELS
    context['leaderboards'] = [] # list of all leaderboards, each leaderboard is a list on tuples, (name, time)

    # this next chunk of code is not ideal but I can't think of a better way
    l1_players = Player.objects.order_by('time_l1').values_list('name', 'time_l1')
    context['leaderboards'].append(l1_players)
    l2_players = Player.objects.order_by('time_l2').values_list('name', 'time_l2')
    context['leaderboards'].append(l2_players)
    l3_players = Player.objects.order_by('time_l3').values_list('name', 'time_l3')
    context['leaderboards'].append(l3_players)
    if len(context['levels']) != len(context['leaderboards']):
        print('***WARNING: mismatch between levels and leaderboards. Check django-server/brachi/navigation/views.py.')

    return render(request, 'navigation/leaderboard.html', context)

def play(request):
    if checkValidSession(request) == False:
        return title(request)
    # TODO: process GET request and return appropriate level
    print(request.GET['level'])
    return level_select(request)

def project(request):
    if checkValidSession(request) == False:
        return title(request)
    # TODO: a page decribing the project
    pass
