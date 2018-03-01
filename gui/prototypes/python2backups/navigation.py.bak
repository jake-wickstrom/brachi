from Tkinter import *

c_width = 500
c_height = 400

master = Tk()
master.title("navigation")

def main():
    create_title_page()

def create_title_page():
    title_page = Frame(master, height=c_height, width=c_width)
    title_page.pack_propagate(0)
    title_page.pack()

    title = Message(title_page, text="Brachi", pady=100)
    title.config(font=("times", 72, "bold"))
    title.pack()

    start_button = Button(title_page, text="Start", command= lambda: navigation_button(title_page, "start"), padx=10, pady=5)
    start_button.pack()
    mainloop()

"""
Params:
    old_page - the old frame to hide
    new_page_type - 'start', 'options', or 'levels'
"""
def navigation_button(old_page, new_page_type):
    old_page.pack_forget()
    old_page.grid_forget()
    if new_page_type == 'start':
        create_start_page()
    elif new_page_type == 'options':
        create_options_page()
    elif new_page_type == 'levels':
        create_levels_page()

def create_start_page():
    start_page = Frame(master, height=c_height, width=c_width)
    start_page.pack_propagate(0)
    start_page.pack()

    play_button = Button(start_page, text="Play", font=("times", 36), command= lambda: navigation_button(start_page, "levels"))
    play_button.pack(pady=40)

    options_button = Button(start_page, text="Options", font=("times", 36), command= lambda: navigation_button(start_page, "options"))
    options_button.pack()

    mainloop()

def create_options_page():
    options_page = Frame(master, height=c_height, width=c_width)
    options_page.grid_propagate(0)
    options_page.grid()

    op_dev_mode = IntVar()
    op_full_screen = IntVar()
    op_third_option = IntVar()
    # Checkbutton.select() will start the button off selected, use this to show what the current values are
    Checkbutton(options_page, text="Developer Mode", variable=op_dev_mode).grid(row=1, column=1, sticky=W, padx=20)
    Checkbutton(options_page, text="Full Screen", variable=op_full_screen).grid(row=2, column=1, sticky=W, padx=20)
    Checkbutton(options_page, text="Some Third Thing", variable=op_third_option).grid(row=3, column=1, sticky=W, padx=20)
    Button(options_page, text="Back", font=("times", 24), command= lambda: navigation_button(options_page, "start")).grid(row=4, column=1)
    Button(options_page, text="Apply", font=("times", 24), command=set_options).grid(row=4, column=2)

    mainloop()

# will just take the values of the check boxes and set global variables to them
def set_options():
    pass

def create_levels_page():
    levels_page = Frame(master, height=c_height, width=c_width)
    levels_page.grid_propagate(0)
    levels_page.grid()

    Button(levels_page, text="1", font=("times", 24), command= lambda: start_level(1)).grid(row=1, column=1)
    Button(levels_page, text="Back", font=("times", 24), command= lambda: navigation_button(levels_page, "start")).grid(row=2, column=1)

    mainloop()

# given a level number, start that level
def start_level(level):
    pass

if __name__ == "__main__":
    main()
