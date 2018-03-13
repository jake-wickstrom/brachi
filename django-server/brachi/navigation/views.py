from django.shortcuts import render

def title(request):
    context = {}
    return render(request, 'navigation/title.html', context)

def level_select(request):
    context = {}
    return render(request, 'navigation/title.html', context)

def leaderboard(request):
    context = {}
    return render(request, 'navigation/title.html', context)

def play(request):
    pass
