def main():
    csvFile = open('trajectory-spline.txt', "r")
    lines = csvFile.readlines()
    xvals = open('xvals.txt', "w")
    yvals = open('yvals.txt', "w")

    xToWrite = "["
    yToWrite = "["

    # xvals.write("[")
    # yvals.write("[")

    for line in lines:
        xyPair = line.split(',')
        # xvals.write(xyPair[0].strip() + ", ")
        # yvals.write(xyPair[1].strip() + ", ")
        xToWrite += xyPair[0].strip() + ", "
        yToWrite += xyPair[1].strip() + ", "

    xToWrite = xToWrite[: -1]
    yToWrite = yToWrite[: -1]
    xToWrite += "];"
    yToWrite += "];"

    xvals.write(xToWrite)
    yvals.write(yToWrite)

if __name__ == "__main__":
    main()
