# Brachi
A web based application of a <a href="https://en.wikipedia.org/wiki/Brachistochrone_curve">Brachistochrone</a> type physics simulation/game which allows users to predict and compare the optimal path of a marble in an arbitrary vector potential. Here, 'optimal' refers to the path which minimizes the time taken for the marble to traverse the curve.

## Path Optimizer
<a href="https://en.wikipedia.org/wiki/Calculus_of_variations">Calculus of variations</a> was used to derive a functional corresponding to the time taken for the marble to complete the path. This functional was then input into the <a href="https://en.wikipedia.org/wiki/Euler%E2%80%93Lagrange_equation">Euler-Lagrange</a> equation. The solution to this differential equation then provided the optimal path of the marble in the given trajectory.

To allow for more complex curves to be drawn and to minmize errors in solving the equation numerically a parametric representaion of the input path was used in the Euler-Lagrange equation. However, this lead to a highly coupled, non-linear, second order differential equation with boundary values which, in most cases, is not possible to solve analytically. After significant research and experimentation the <a href="https://en.wikipedia.org/wiki/Shooting_method">shooting method</a> was used to solve the equation numerically.

For a more in depth mathmatical explanation of this process see `final_report.pdf` 

## Front End Physics Simulation
The main interface in the application allows users to draw an arbitrary but continuous path within the main canvas. During this process the location of the mouse is recorded and a parametric cubic spline is interpolated along the input curve. This allows for a smooth curve in any direction to be input into the physics simulation. 

Once initiated the application will simulate the motion of a marble fixed along this path in whichever potential energy field has been selected by the user. The simulation steps through arc length segments of the curve in order to calculate the time taken to traverse each segment; this information is then used to animate the marble's trajectory. The optimal path between the given end points is calculated using the Euler-Lagrange method and is shown to the user as desired. For a more explicit mathmatical explanation see `final_report.pdf`

## Setting Up the Web Server
This section provides a brief overview on how to set up and run the Brachi server on your computer so you can play it for yourself.

### Requirements
1. Clone this GitHub repository to your machine.
2. Have Python 3 installed. The project was developed with Python 3.6.4 in mind only, so compatibilty with other versions is not guaranteed. Python can be downloaded from <a href="https://www.python.org/downloads/">here</a>.
3. Install Django. Django is the Python package that we created the web server with. The project was developed with Django 2.0.3 and we cannot guarantee compatibility with other versions. For help with installing Django, see <a href="https://docs.djangoproject.com/en/2.0/topics/install">this page</a> and follow your choice of instructions under the "Install the Django code" heading.

### Running The Server Locally
The instructions in this section will allow you to run the Brachi server on your own machine, viewable and playable through your web browser. 

1. Open a Command Line (Windows), PowerShell (Windows; alternate), or Terminal (MacOS/Linux) window and navigate to the `brachi/django-server/brachi` directory on your machine (from the location you cloned the repository to). If you type `ls` or `dir` you should see a file called `manage.py`. If you do not see this file, you are in the wrong place.
2. If this is your first time running the server on your machine, type `python manage.py migrate` to configure the database. This command will not cause any problems if you have run the server before, so if in doubt just run it.
3. Type `python manage.py runserver` to run the server. Open a web browser and go to `127.0.0.1:8000/navigation/title` in the address bar to start playing!

*As a side note, the database is used to store user's times and usernames. If you ever want to reset the database, you can type* `python manage.py flush`.

### Running The Server on a Wi-Fi Node
The instructions in this section will allow you to run the Brachi server for anyone on the same Wi-Fi node as your machine. This section is a bit more involved and you should be familiar with the previous subsection on running the server locally before attempting this. These steps may not work on every Wi-Fi node as your router may need to be configured appropriately. The method for configuring your router will not be described here. If you are unsure about the configuration of your router, give these steps a try to see if they just work (they often do).

1. Make sure that your machine is connected to the Wi-Fi node that you want to deploy the server to.
2. Find the IPv4 address of the Wi-Fi node you are on and make note of it. You can generally find this information in the properties of your network connection (use Google for operating system specific instructions).
3. In a Command Line, PowerShell, or Terminal window, navigate to the `brachi/django-server/brachi` directory. Type `python manage.py runserver 0.0.0.0:8000` exactly as it is written to run the server on port 8000 on your machine.
4. Anyone on the same Wi-Fi node as you (including yourself) can go to the following url in their web browsers to access the server: `128.189.231.64:8000/navigation/title`, (replacing the sample IPv4 address with the IPv4 address of your Wi-Fi node). Have fun!
