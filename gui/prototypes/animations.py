from Tkinter import *
from math import *
import time

bound = [20, 20, 100, 20] # top, right, bottom, left
c_width = 500
c_height = 400
python_green = "#476042"
start = (40, 40)
end = (380 ,280)
circle_size = 10

mass = 1.0
g = 1000.0
ball_radius = 4

points = [] # list of all points drawn in chronological order
line_ids = []
line_segments = []

master = Tk()
master.title("drawing_lines")
w = Canvas(master, width=c_width, height=c_height)
w.grid()
w.grid_propagate(0)

def main():
    w.bind("<B1-Motion>", paint_line)
    w.bind("<ButtonRelease-1>", track_segments)
    img = PhotoImage(file="../resources/yellow_paper.gif")
    w.create_image(0, 0, anchor=NW, image=img)

    undo_button = Button(w, text="Undo", font=('times', 24), command=undo_line)
    undo_button.grid(row=0, column=0, columnspan=1, sticky=SW, pady=c_height-80, padx=20)
    run_button = Button(w, text="Run", font=('times', 24), command=run_simulation)
    run_button.grid(row=0, column=1, columnspan=2, sticky=SE, pady=c_height-80)

    draw_bounds()
    draw_start_end()

    mainloop()

def draw_bounds():
    w.create_line(bound[3], bound[0], c_width - bound[1], bound[0], fill=python_green, dash=[4, 2])
    w.create_line(c_width - bound[1], bound[0], c_width - bound[1], c_height - bound[2], fill=python_green, dash=[4, 2])
    w.create_line(c_width - bound[1], c_height - bound[2], bound[3], c_height - bound[2], fill=python_green, dash=[4, 2])
    w.create_line(bound[3], c_height - bound[2], bound[3], bound[0], fill=python_green, dash=[4, 2])

def draw_start_end():
    w.create_oval(start[0] - circle_size, start[1] - circle_size, start[0] + circle_size, start[1] + circle_size)
    w.create_oval(end[0] - circle_size, end[1] - circle_size, end[0] + circle_size, end[1] + circle_size)

def paint_line(event):
    if event_in_bounds(event):
        if len(points) == 0:
            points.append((event.x, event.y))
        else:
            line_id = w.create_line(points[-1][0], points[-1][1], event.x, event.y, fill=python_green, smooth=1, width=2.0)
            line_ids.append(line_id)
            points.append((event.x, event.y))

def run_simulation():
    if len(points) > 1 and (euclidean_distance(start, points[0]) <= circle_size and euclidean_distance(end, points[-1]) <= circle_size):
        delta_times = [0]
        points_at_times = [points[0]]
        v = 0.0
        i = 0
        t = 0.0
        direction = 1
        E_0 = mass * g * (c_height - points[0][1]) + 0.5 * mass * v**2
        while t < 30.0 and i < len(points) - 1:
            E_current = mass * g * (c_height - points[i][1]) + 0.5 * mass * v**2
            E_next = mass * g * (c_height - points[i+1][1])
            if i > 0:
                E_prev = mass * g * (c_height - points[i-1][1])
            else:
                E_prev = float('inf')
            if E_current < E_next and direction == 1:
                direction = -1
            elif E_current < E_prev and direction == -1:
                direction = 1
            if direction == 1:
                E_to = E_next
            else:
                E_to = E_prev
            Ek = E_0 - E_to
            v = sqrt(2 * Ek / mass)
            try:
                dt = euclidean_distance(points[i], points[i + direction]) / v
                points_at_times.append(points[i + direction])
                i = i + direction
            except ZeroDivisionError:
                dt = 0.1
                points_at_times.append(points[i])
                i = len(points)
            t = t + dt
            delta_times.append(dt)

        animate(delta_times, points_at_times)
    else:
        print 'cannot run'

def animate(t, p):
    time.sleep(t[0])
    ball = w.create_oval(p[0][0]-ball_radius, p[0][1]-ball_radius, p[0][0]+ball_radius, p[0][1]+ball_radius)
    w.update_idletasks()
    for i in xrange(1, len(t)):
        time.sleep(t[i])
        w.delete(ball)
        w.update_idletasks()
        ball = w.create_oval(p[i][0]-ball_radius, p[i][1]-ball_radius, p[i][0]+ball_radius, p[i][1]+ball_radius)
        w.update_idletasks()

# p = (x, y)
def euclidean_distance(p1, p2):
    return sqrt(float((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2))

def track_segments(event):
    if len(line_segments) == 0:
        line_segments.append((0, len(line_ids) - 1))
    else:
        line_segments.append((line_segments[-1][1] + 1, len(line_ids) - 1))

def undo_line():
    if len(line_segments) > 0:
        for i in xrange(line_segments[-1][1] + 1, line_segments[-1][0], -1):
            w.delete(line_ids[-1])
            del line_ids[-1]
            del points[-1]
        del line_segments[-1]
        if len(points) == 1:
            del points[-1]

def event_in_bounds(event):
    if event.x >= bound[3] and event.x <= c_width - bound[1] and event.y >= bound[0] and event.y <= c_height - bound[2]:
        return True
    else:
        return False

if __name__ == "__main__":
    main()
