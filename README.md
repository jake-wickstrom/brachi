# Brachi
A web based application of a <a href="https://en.wikipedia.org/wiki/Brachistochrone_curve">Brachistochrone</a> type physics simulation/game which allows users to predict and compare the optimal path of a marble in an arbitrary vector potential. Here, 'optimal' refers to the path which minimizes the time taken for the marble to traverse the curve.

## Front End Physics Simulation
The main interface in the application allows users to draw an arbitrary but continuous path within the main canvas. During this process the location of the mouse is recorded and a parametric cubic spline is interpolated along the input curve. This allows for a smooth curve in any direction to be input into the physics simulation. 

Once initiated the application will simulate the motion of a marble fixed along this path in whichever potential energy field has been selected by the user. The simulation steps through arc length segments of the curve in order to calculate the time taken to traverse each segment; this information is then used to animate the marble's trajectory. The optimal path between the given end points is calculated using the Euler-Lagrange method and is shown to the user as desired. See the `Math` section for more information on how this was done. 
