import numpy as np
import matplotlib.pyplot as pl
import scipy.stats as st


x = np.linspace(0,10,100)
y = np.sin(x)
xmin, xmax = 0, 1
ymin, ymax = 0, 1

# Peform the kernel density estimate
xx, yy = np.mgrid[xmin:xmax:1000j, ymin:ymax:1000j]
positions = np.vstack([xx.ravel(), yy.ravel()])

f1 = yy
f1_t = np.transpose(f1)

f2 = np.power(yy,2)
f2_t = np.transpose(f2)

f3 = np.power((yy-0.5),2) - xx
f3_t = np.transpose(f3)

f4 = np.power((yy-0.5),2) - xx + 0.1/np.sqrt(np.power((yy-0.5),2)+np.power((xx-(.95-.05)/2),2)) - 0.1/np.sqrt(np.power((yy-0.5-0.18*2),2)+np.power((xx-.95),2))
f4[f4 > 1.5*np.max(f3)] = 1.5*np.max(f3)
f4[f4 < 1.5*np.min(f3)] = 1.5*np.min(f3)
f4_t = np.transpose(f4)

f5 = np.sin(xx*np.pi) + np.sin(yy*np.pi)
f5_t = np.transpose(f5)

f6 = np.sin((yy+.5)*np.cos(np.pi*2*xx))
f6_t = np.transpose(f6)

f7 = -0.03/np.sqrt(np.power((yy-0.5),2)+np.power((xx-(.95-.05)/2),2)) - 0.1/np.sqrt(np.power((yy-0.5-0.18*2),2)+np.power((xx-.95),2)) -0.06/np.sqrt(np.power((yy-0.1),2)+np.power((xx-.8),2)) -0.04/np.sqrt(np.power((yy-0.15),2)+np.power((xx-.15),2))
f7[f7 > 1.5*np.max(f3)] = 1.5*np.max(f3)
f7[f7 < 1.5*np.min(f3)] = 1.5*np.min(f3)
f7_t = np.transpose(f7)

functions = [[f1,f1_t,"Level1"],[f2,f2_t,"Level2"],[f3,f3_t,"Level3"],[f4,f4_t,"Level4"],[f5,f5_t,"Level5"],[f6,f6_t,"Level6"],[f7,f7_t,"Level7"]]

for f in functions:
    pl.figure()
    ax = pl.gca()

    #Gradient plot (https://stackoverflow.com/questions/44836348/how-to-increase-color-resolution-in-python-matplotlib-colormap)
    #IM = ax1.imshow(f[1], cmap="Purples", origin='lower', extent=(-3, 3, -3, 3))
    
    # Contourf plot
    cfset = ax.contourf(xx, yy, f[0], cmap='Purples')
    cset = ax.contour(xx, yy, f[0], colors='k')
    
    # Contourf plot with labels
    #cfset = ax3.contourf(xx, yy, f[0], cmap='Purples')
    #cset = ax3.contour(xx, yy, f[0], colors='k')
    # Label plot
    #ax3.clabel(cset, inline=1, fontsize=10)
    #ax.set_xlabel('Y1')
    #ax.set_ylabel('Y0')
    
    ax.set_aspect('equal')
    ax.set_xlim(xmin, xmax)
    ax.set_ylim(ymin, ymax)
    ax.get_xaxis().set_visible(False)
    ax.get_yaxis().set_visible(False)
    pl.savefig(f[2],bbox_inches='tight',dpi = 500)

pl.show()
