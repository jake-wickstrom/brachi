from django.shortcuts import render
from navigation.models import Player

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
                # TODO: create session
                return level_select(request)
        except Exception as e:
            print(e)
            pass # must be an invalid input, just let the return below catch it
    # if anything about fails, come here
    return title(request, invalid_name=True)

def level_select(request):
    context = {}
    # TODO: update this, maybe find a better place to put a global constant
    context['levels'] = ['Brachistochrone', 'Brachistochrone^2', 'Level 3']
    return render(request, 'navigation/level_select.html', context)

def leaderboard(request):
    context = {}
    return render(request, 'navigation/leaderboard.html', context)

def play(request):
    # TODO: process GET request and return appropriate level
    print(request.GET['level'])
    return level_select(request)
    pass

def project(request):
    pass
