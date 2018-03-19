close all

XX = linspace(0,2,1000);
points = [0,1,0,1,2,3;0,1,2,2,3,0]
plot(points(1,:),points(2,:))

hold on
%plot(XX,XY,'or')

distvec = dist(points);
arcvec = zeros(1,length(dist(points)));
arclentemp = 0;

for i = 1:length(dist(points))-1
    arcvec(i) = arclentemp;
    arclentemp = arclentemp + distvec(i,i+1);
end

arcvec(i+1) = arclentemp;

arcvec

XXS = linspace(0,arcvec(end),1000);
XS = spline(arcvec,points(1,:),XXS);
YS = spline(arcvec,points(2,:),XXS);


plot(XS,YS,'x')
