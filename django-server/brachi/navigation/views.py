import json
from django.shortcuts import render
from django.http import HttpResponse
from django import forms
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from navigation.models import Player
from navigation.static import *

class SubmitTimeForm(forms.Form):
    level = forms.IntegerField()
    time = forms.FloatField()

def checkValidSession(request):
    if 'username' in request.session:
        if request.session['username'] in Player.objects.values_list('name', flat=True):
            return True
    return False

def title(request, invalid_name=False, session_error=False):
    context = {}
    context['invalid_name'] = invalid_name
    context['session_error'] = session_error
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
        return title(request, session_error=True)
    context = {}
    context['levels'] = ALL_LEVELS
    return render(request, 'navigation/level_select.html', context)

def leaderboard(request):
    if checkValidSession(request) == False:
        return title(request, session_error=True)
    context = {}
    context['levels'] = ALL_LEVELS
    context['leaderboards'] = [] # list of all leaderboards, each leaderboard is a list on tuples, (name, time)

    # this next chunk of code is not ideal but I can't think of a better way
    l0_players = Player.objects.order_by('time_l0').values_list('name', 'time_l0')
    context['leaderboards'].append(l0_players)
    l1_players = Player.objects.order_by('time_l1').values_list('name', 'time_l1')
    context['leaderboards'].append(l1_players)
    l2_players = Player.objects.order_by('time_l2').values_list('name', 'time_l2')
    context['leaderboards'].append(l2_players)
    if len(context['levels']) != len(context['leaderboards']):
        print('***WARNING: mismatch between levels and leaderboards. Check django-server/brachi/navigation/views.py.')

    return render(request, 'navigation/leaderboard.html', context)

def play(request):
    if checkValidSession(request) == False:
        return title(request, session_error=True)
    context = {}
    context['script'] = """
    <script>
        /*
         * Gets the potential energy at a point.
         * Parameters:
         *  x    - the x coordinate on the canvas of potential.
         *  y    - the y coordinate on the canvas ADJUSTED to account for the coordinate system change.
         *  xmax - the width of the canvas.
         *  ymax - the height of the canvas.
         */
    """
    try:
        if (int(request.GET['level']) == 1):
            context['level'] = 1
            context['script'] = context['script'] + """
                function getPotential(x, y, xmax, ymax) {
                    var x_pos = x / xmax;
                    var y_pos = y / ymax;
                    return 1000*y_pos;
                }
            </script>
            """
            return render(request, 'navigation/level.html', context)
    except Exception as e:
        print(e)
    return level_select(request)

@method_decorator(csrf_exempt)
def play_submit(request):
    if checkValidSession(request) == False:
        return title(request, session_error=True)
    try:
        form = SubmitTimeForm(request.POST)
        your_time = float(form.data['time'][0])
        level = int(form.data['level'][0])
        your_name = request.session['username']
        player = Player.objects.get(name=your_name)
        if level == 1:
            # TODO: check that time is better, maybe check invalid times?
            player.time_l1 = your_time
        else:
            raise ValueError("Invalid level passed when submitting user time data.")
        player.save()
    except:
        return title(request, session_error=True)
    return HttpResponse(json.dumps({'message': 'Time submitted.'}), content_type = 'application/json')

def project(request):
    if checkValidSession(request) == False:
        return title(request, session_error=True)
    context = {}
    return render(request, 'navigation/project.html', context)
