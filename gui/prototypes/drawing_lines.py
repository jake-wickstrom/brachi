from Tkinter import *

bound = 20
c_width = 500
c_height = 400
python_green = "#476042"
points = [] # list of all points drawn in chronological order
line_ids = []
line_segments = []

master = Tk()
master.title("drawing_window")
w = Canvas(master, width=c_width, height=c_height)
w.pack(expand=YES, fill=BOTH)

def main():
    w.bind("<B1-Motion>", paint_line)
    w.bind("<ButtonRelease-1>", track_segments)
    w.bind("<Button-3>", undo_line)
    img = PhotoImage(file="../resources/yellow_paper.gif")
    w.create_image(0, 0, anchor=NW, image=img)
    draw_bounds(w)
    mainloop()

def draw_bounds(w):
    w.create_line(bound, bound, c_width - bound, bound, fill=python_green, dash=[4, 2])
    w.create_line(c_width - bound, bound, c_width - bound, c_height - bound, fill=python_green, dash=[4, 2])
    w.create_line(c_width - bound, c_height - bound, bound, c_height - bound, fill=python_green, dash=[4, 2])
    w.create_line(bound, c_height - bound, bound, bound, fill=python_green, dash=[4, 2])

def paint_line(event):
    if event_in_bounds(event):
        if len(points) == 0:
            points.append((event.x, event.y))
        else:
            line_id = w.create_line(points[-1][0], points[-1][1], event.x, event.y, fill=python_green, smooth=1, width=2.0)
            line_ids.append(line_id)
            points.append((event.x, event.y))
        print points

def track_segments(event):
    if len(line_segments) == 0:
        line_segments.append((0, len(line_ids) - 1))
    else:
        line_segments.append((line_segments[-1][1] + 1, len(line_ids) - 1))
    print line_segments

def undo_line(event):
    if len(line_segments) > 0:
        for i in xrange(line_segments[-1][1] + 1, line_segments[-1][0], -1):
            w.delete(line_ids[-1])
            del line_ids[-1]
            del points[-1]
        del line_segments[-1]
        if len(points) == 1:
            del points[-1]
    print points
    print line_segments

def event_in_bounds(event):
    if event.x >= bound and event.x <= c_width - bound and event.y >= bound and event.y <= c_height - bound:
        return True
    else:
        return False

if __name__ == "__main__":
    main()
