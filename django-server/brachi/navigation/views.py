import json
from django import forms
from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from navigation.models import Player
from navigation.static import *

"""
This class is used when users play one of the levels. Their times are sent to the
server and processed by being made into a form like this.
"""
class SubmitTimeForm(forms.Form):
    level = forms.IntegerField()
    time = forms.FloatField(max_value=1000.0, min_value=0.0)

"""
Checks that the user's session contains a valid username. This function should be
called at the beginning of every view (with the exception of the title and login)
as follows:

if checkValidSession(request) == False:
    return title(request, session_error=True)
"""
def checkValidSession(request):
    if 'username' in request.session:
        if request.session['username'] in Player.objects.values_list('name', flat=True):
            return True
    return False

"""
This view handles the title/login screen. The two optional flags can be used
by the html title page itself to display error messages.
"""
def title(request, invalid_name=False, session_error=False):
    context = {}
    context['invalid_name'] = invalid_name
    context['session_error'] = session_error
    existing_names = Player.objects.values_list('name', flat=True)
    # adds a few wacky characters to the database if they do not already exist,
    # this is the best place to put these such that they are added relatively soon
    # to startup
    if 'Sonic the Hedgehog' not in existing_names:
        sonic = Player(name='Sonic the Hedgehog', time_l0=IDEAL_TIMES[0]+0.14, time_l1=IDEAL_TIMES[1]+0.21, time_l2=IDEAL_TIMES[2]+0.05, time_l3=IDEAL_TIMES[3]+0.2, time_l4=IDEAL_TIMES[4]+0.17, time_l5=IDEAL_TIMES[5]+0.01, time_l6=IDEAL_TIMES[6]+0.01)
        sonic.save()
    if 'Daymon' not in existing_names:
        daymon = Player(name='Daymon', time_l0=IDEAL_TIMES[0], time_l1=IDEAL_TIMES[1], time_l2=IDEAL_TIMES[2], time_l3=IDEAL_TIMES[3], time_l4=IDEAL_TIMES[4], time_l5=IDEAL_TIMES[5], time_l6=IDEAL_TIMES[6])
        daymon.save()
    return render(request, 'navigation/frontpage.html', context)

"""
Creates a Player object in the database for the user if the username they provided
was valid. The username is tied to the session to keep the user "logged in" so
we can add to their Player object in the database later when they play the game.
"""
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
            pass # username must be invalid, just let the return below catch it
    return title(request, invalid_name=True)

"""
This view handles the main landing page with access to levels, leaderboards,
and the project page.
"""
def level_select(request):
    if checkValidSession(request) == False:
        return title(request, session_error=True)
    context = {}
    context['levels'] = ALL_LEVELS
    return render(request, 'navigation/levelSelector.html', context)

"""
Queries the database such that the front end can construct leaderboards based
on player performance across levels.
"""
def leaderboard(request):
    if checkValidSession(request) == False:
        return title(request, session_error=True)
    context = {}
    context['levels'] = ALL_LEVELS
    context['leaderboards'] = [] # list of all leaderboards, each leaderboard is a list of tuples, (name, time)

    # here we grab all of the Player objects from the database and order them so
    # the front end can construct leaderboards
    l0_players = Player.objects.order_by('time_l0').values_list('name', 'time_l0')
    context['leaderboards'].append(l0_players)
    l1_players = Player.objects.order_by('time_l1').values_list('name', 'time_l1')
    context['leaderboards'].append(l1_players)
    l2_players = Player.objects.order_by('time_l2').values_list('name', 'time_l2')
    context['leaderboards'].append(l2_players)
    l3_players = Player.objects.order_by('time_l3').values_list('name', 'time_l3')
    context['leaderboards'].append(l3_players)
    l4_players = Player.objects.order_by('time_l4').values_list('name', 'time_l4')
    context['leaderboards'].append(l4_players)
    l5_players = Player.objects.order_by('time_l5').values_list('name', 'time_l5')
    context['leaderboards'].append(l5_players)
    l6_players = Player.objects.order_by('time_l6').values_list('name', 'time_l6')
    context['leaderboards'].append(l6_players)
    # this "if" should never fire in production, it is used to remind the developers
    # in case we forget to update this section of code when new levels are added
    if len(context['levels']) != len(context['leaderboards']):
        print('***WARNING: mismatch between levels and leaderboards. Check django-server/brachi/navigation/views.py.')
    return render(request, 'navigation/leaderboard.html', context)

"""
Handles users selecting a level from the level select landing page. This function
will also construct some Javascript functions to send to the front end based on
the level the user has selected.
"""
def play(request):
    if checkValidSession(request) == False:
        return title(request, session_error=True)
    context = {}
    try:
        get_level = int(request.GET['level'])
        # generate the getPotential() functions to be sent to the front end for each level
        # TODO: make sure these are correct
        if get_level == 0:
            context['script'] = """
            <script>
                function getPotential(x, y, xmax, ymax) {
                    var x_pos = x / xmax;
                    var y_pos = y / ymax;
                    return 1000*y_pos;
                }
            </script>
            """
        elif get_level == 1:
            context['script'] = """
            <script>
                function getPotential(x, y, xmax, ymax) {
                    var x_pos = x / xmax;
                    var y_pos = y / ymax;
                    return 1000*y_pos;
                }
            </script>
            """
        elif get_level == 2:
            context['script'] = """
            <script>
                function getPotential(x, y, xmax, ymax) {
                    var x_pos = x / xmax;
                    var y_pos = y / ymax;
                    return 1000*y_pos;
                }
            </script>
            """
        elif get_level == 3:
            context['script'] = """
            <script>
                function getPotential(x, y, xmax, ymax) {
                    var x_pos = x / xmax;
                    var y_pos = y / ymax;
                    return 1000*y_pos;
                }
            </script>
            """
        elif get_level == 4:
            context['script'] = """
            <script>
                function getPotential(x, y, xmax, ymax) {
                    var x_pos = x / xmax;
                    var y_pos = y / ymax;
                    return 1000*y_pos;
                }
            </script>
            """
        elif get_level == 5:
            context['script'] = """
            <script>
                function getPotential(x, y, xmax, ymax) {
                    var x_pos = x / xmax;
                    var y_pos = y / ymax;
                    return 1000*y_pos;
                }
            </script>
            """
        elif get_level == 6:
            context['script'] = """
            <script>
                function getPotential(x, y, xmax, ymax) {
                    var x_pos = x / xmax;
                    var y_pos = y / ymax;
                    return 1000*y_pos;
                }
            </script>
            """
        else:
            raise ValueError("Invalid level in GET request.")
        context['level'] = get_level
        context['level_name'] = ALL_LEVELS[get_level]
        context['start_point'] = START_POINTS[get_level]
        context['end_point'] = END_POINTS[get_level]
        context['level_image_link'] = LEVEL_IMAGES[get_level]
        context['solution_image_link'] = SOLUTION_IMAGES[get_level]
        return render(request, 'navigation/simulation_page.html', context)
    except:
        pass # just let the return below handle it
    # if the level in the GET request was not legitimate, just send the user to
    # the level select page again
    return level_select(request)

# The method decorator below disables a safety check that Django does on POST requests.
# Given the way we are doing our POST requests, it is much easier to do this than
# to figure out how to make it work properly. This is fine because we are never
# intending to deploy this web server to the internet, it is going to be run on
# local wifi networks where this protection is unnecessary.
"""
This function handles the POST requests that are submitted when the user plays the
game and generates a time (for any level). The POST request is processed, and if
the time is better than their previous time for that level, the database will be
updated. This view does not cause the page to reload when used with an ajax call
from the front end.
"""
@method_decorator(csrf_exempt)
def play_submit(request):
    if checkValidSession(request) == False:
        return title(request, session_error=True)
    try:
        form = SubmitTimeForm(request.POST)
        your_time = float(form.data['time'])
        level = int(form.data['level'])
        your_name = request.session['username']
        player = Player.objects.get(name=your_name)
        if level == 0:
            if player.time_l0 > your_time and player.solution_seen_l0 == False:
                player.time_l0 = your_time
                player.save()
        elif level == 1:
            if player.time_l1 > your_time and player.solution_seen_l1 == False:
                player.time_l1 = your_time
                player.save()
        elif level == 2:
            if player.time_l2 > your_time and player.solution_seen_l2 == False:
                player.time_l2 = your_time
                player.save()
        elif level == 3:
            if player.time_l3 > your_time and player.solution_seen_l3 == False:
                player.time_l3 = your_time
                player.save()
        elif level == 4:
            if player.time_l4 > your_time and player.solution_seen_l4 == False:
                player.time_l4 = your_time
                player.save()
        elif level == 5:
            if player.time_l5 > your_time and player.solution_seen_l5 == False:
                player.time_l5 = your_time
                player.save()
        elif level == 6:
            if player.time_l6 > your_time and player.solution_seen_l6 == False:
                player.time_l6 = your_time
                player.save()
        else:
            raise ValueError("Invalid level passed when submitting user time data.")
    except:
        return title(request, session_error=True)
    # This return will not refresh or reload the page the user is on if used with
    # a proper ajax call.
    return HttpResponse(json.dumps({'message': 'Time submitted.'}), content_type = 'application/json')

"""
Handles the POST request generated when a user views the solution to a level.
Viewing the solution sets a flag in the database that will prevent the user from
submitting any more times for that level.
"""
@method_decorator(csrf_exempt)
def play_solution(request):
    if checkValidSession(request) == False:
        return title(request, session_error=True)
    try:
        level = int(request.POST['level'])
        your_name = request.session['username']
        player = Player.objects.get(name=your_name)
        if level == 0:
            player.solution_seen_l0 = True
            player.save()
        elif level == 1:
            player.solution_seen_l1 = True
            player.save()
        elif level == 2:
            player.solution_seen_l2 = True
            player.save()
        elif level == 3:
            player.solution_seen_l3 = True
            player.save()
        elif level == 4:
            player.solution_seen_l4 = True
            player.save()
        elif level == 5:
            player.solution_seen_l5 = True
            player.save()
        elif level == 6:
            player.solution_seen_l6 = True
            player.save()
        else:
            raise ValueError("Invalid level passed when requesting solution.")
    except:
        return title(request, session_error=True)
    # This return will not refresh or reload the page the user is on if used with
    # a proper ajax call.
    return HttpResponse(json.dumps({'message': 'Solution viewed.'}), content_type = 'application/json')

"""
Distributes the project description page.
"""
def project(request):
    if checkValidSession(request) == False:
        return title(request, session_error=True)
    context = {}
    return render(request, 'navigation/about.html', context)
