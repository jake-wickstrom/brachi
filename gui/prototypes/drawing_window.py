from Tkinter import *

c_width = 500
c_height = 400

master = Tk()
master.title("drawing_window")
w = Canvas(master, width=c_width, height=c_height)
w.pack(expand=YES, fill=BOTH)

def main():
    w.bind("<B1-Motion>", paint)
    mainloop()

def paint(event):
    python_green = "#476042"
    x1, y1 = (event.x - 1), (event.y - 1)
    x2, y2 = (event.x + 1), (event.y + 1)
    w.create_oval(x1, y1, x2, y2, fill=python_green)

if __name__ == "__main__":
    main()
