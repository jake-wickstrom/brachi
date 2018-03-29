clear all;
close all;
hold on
warning off %ode15i generates many warnings 

%Good results can be found by starting with wide ranges and lower
%resolution, noting where the best solution tends to be or if it is
%railing, and narrowing search focus accordingly.

%IC angle range
dydxStart = 2*pi*0;
dydxEnd =   2*pi*1;
%IC angle resolution
dydxInc = 2*pi/90;
%IC scale range and resolution in powers of ten (too extreme causes problems)
scales = 10.^linspace(-16,-6,20);
%interpolation settings
interpRes = 1e3; %reduce if getting odd loops/zig-zags
interpMode = 'linear'; %pchip is better, but much slower than linear
%initial KE, setting exactly to 0 causes division by 0 in DEs
Tinit = 1e-3;
%start point
xi = 0.05;
yi = 0.5+0.18;
%end point
xf = 0.95;
yf = 0.5-0.09;
%NOTE: Avoid BCs that are vertical to each other as slope is used for curve fitting

m = abs((yf-yi)/(xf-xi));
fitLinex = [xi-1e0*(xf-xi) xi xi-1e0*(xf-xi) xi xi+1e0*(xf-xi) xi xi+1e0*(xf-xi)];
fitLiney = [yi-1e0*(yf-yi) yi yi+1e0*(yf-yi) yi yi-1e0*(yf-yi) yi yi+1e0*(yf-yi)];
tBest = inf;
syms x(s) y(s) U(x, y) x2 y2

%NOTE: When changing U it must also be manually changed in the time calculation below (line ~111)

% U = -1/sqrt(y^2+x^2)+1/sqrt(y^2+(x+0.5)^2)-1/sqrt((y-2)^2+x^2); %attractive charges at (0,0), (0,2), repulsive charge at (-0.5,0)
% U2 = -1/sqrt(y2^2+x2^2)+1/sqrt(y2^2+(x2+0.5)^2)-1/sqrt((y2-2)^2+x2^2); %for contour plots

% U = -1/sqrt(y^2+x^2)-1/sqrt(y^2+(x+0.5)^2)-1/sqrt((y-2)^2+x^2)-1/sqrt((y-1)^2+(x-2)^2); %attractive charges at (0,0), (0,2), (-0.5,0), (2,1)
% U2 = -1/sqrt(y2^2+x2^2)-1/sqrt(y2^2+(x2+0.5)^2)-1/sqrt((y2-2)^2+x2^2)-1/sqrt((y2-1)^2+(x2-2)^2);
% U = -U; %repulsive version ("asteroid field")
% U2 = -U2;

% U = y; %constant g-field
% U2 = y2;

% U = y^2;
% U2 = 1e-99*x2 + y2^2;

% U = sin(x) + sin(y);
% U2 = sin(x2) + sin(y2);

% U = y^2 - x + 1/sqrt((y-0)^2+(x-2.5)^2) - 1/sqrt((y-2)^2+(x-5)^2);
% U2 = y2^2 - x2 + 1/sqrt((y2-0)^2+(x2-2.5)^2) - 1/sqrt((y2-2)^2+(x2-5)^2);

U = (y-0.5)^2 - x + 1/sqrt((y-0.5)^2+(x-(xf-xi)/2)^2) - 1/sqrt((y-0.5-0.18*2)^2+(x-xf)^2);
U2 = (y2-0.5)^2 - x2 + 1/sqrt((y2-0.5)^2+(x2-(xf-xi)/2)^2) - 1/sqrt((y2-0.5-0.18*2)^2+(x2-xf)^2);

% U = atan(y/x);
% U2 = atan(y2/x2);

E = eval(subs(U, [x(s),y(s)], [xi,yi]))+Tinit; %Set initial KE to Tinit
if eval(subs(U, [x(s),y(s)], [xf,yf])) > E-Tinit
    disp('Forbidden Endpoint')
    return
end

odex = diff(x,s,2) ==   (functionalDerivative(U,x(s))*(diff(x,s)^2*diff(y,s)^2+diff(y,s)^4)...
                        -functionalDerivative(U,y(s))*(diff(x,s)^3*diff(y,s)+diff(x,s)*diff(y,s)^3)...
                        +(E-U)*diff(x,s)*diff(y,s)*diff(y,s,2))...
                        /(2*(E-U)*diff(y,s)^2);
odey = diff(y,s,2) ==   (functionalDerivative(U,y(s))*(diff(x,s)^2*diff(y,s)^2+diff(x,s)^4)...
                        -functionalDerivative(U,x(s))*(diff(x,s)^3*diff(y,s)+diff(x,s)*diff(y,s)^3)...
                        +(E-U)*diff(x,s)*diff(y,s)*diff(x,s,2))...
                        /(2*(E-U)*diff(x,s)^2);
odes = [odex; odey];
vars = [x(s), y(s)];
[odes,vars] = reduceDifferentialOrder(odes,vars);
f = daeFunction(odes, vars);
F = @(t,S,SP) f(t,S,SP);

for theta = dydxStart:dydxInc:dydxEnd
    for dydxScale = scales
        %rotate ICs
        dxi = cos(theta)*dydxScale;
        dyi = sin(theta)*dydxScale;
        disp([dxi dyi theta])
        
        %ICs
        t0 = 0;
        s0 = [xi;yi;dxi;dyi];
        sp0 = [dxi;dyi;0;0];

        %solve system and remove duplicate points
        [~, sol] = ode15i(F, [t0, 1e9], s0, sp0);
        [xsolRaw,ia,~] = unique(sol(:,1),'stable');
        if (numel(xsolRaw) < 2)
            continue
        end
        ysolRaw = sol(:,2);
        ysolRaw = ysolRaw(ia);
        
        %interpolate solution
        pt = interparc(interpRes,xsolRaw,ysolRaw,interpMode);
        xsolRawInterp = pt(:,1);
        ysolRawInterp = pt(:,2);
        %find best fit to BCs (based on relative position of start and end points)
        [~,fitIndex] = min( abs( abs((ysolRawInterp(2:end)-yi)./(xsolRawInterp(2:end)-xi)) - m ) );
        [~,~,fitIndices,~] = intersections(xsolRawInterp(2:end),ysolRawInterp(2:end),fitLinex,fitLiney);
        fitIndices = unique([round(fitIndices)' fitIndex]);
        for fitIndex = fitIndices
            if fitIndex + 1 > numel(xsolRawInterp)
                fitIndex = fitIndex - 1;
            end
            xsol = xsolRawInterp(1:fitIndex+1);
            if numel(xsol) < 2
                continue
            end
            ysol = ysolRawInterp(1:fitIndex+1);
            %scale best fit to BCs
            xsol = (xsol-xi)*(xf-xi)/(xsol(end)-xi)+xi;
            ysol = (ysol-yi)*(yf-yi)/(ysol(end)-yi)+yi;
            %interpolate scaled solution
            pt = interparc(interpRes,xsol,ysol,interpMode);
            xsol = pt(:,1);
            ysol = pt(:,2);

            %time = d/v, v=sqrt(E-U)
            d = sqrt((ysol(2)-ysol(1))^2+(xsol(2)-xsol(1))^2); %interparc generates equidistant points
%             time = sum( d ./ sqrt(E - ...
%                 -( -1./sqrt(ysol(2:end).^2+xsol(2:end).^2)...
%                 -1./sqrt(ysol(2:end).^2+(xsol(2:end)+0.5).^2)...
%                 -1./sqrt((ysol(2:end)-2).^2+xsol(2:end).^2)...
%                 -1./sqrt((ysol(2:end)-1).^2+(xsol(2:end)-2).^2) )) );
%             time = sum( d ./ sqrt(E - ...
%                 ( ysol(2:end) )) );
            time = sum( d ./ sqrt(E - ...
                ( (ysol(2:end)-0.5).^2 - xsol(2:end)...
                + 1./sqrt((ysol(2:end)-0.5).^2+(xsol(2:end)-(xf-xi)/2).^2)...
                - 1./sqrt((ysol(2:end)-0.5-0.18*2).^2+(xsol(2:end)-xf).^2) )) );
%             time = sum( d ./ sqrt(E - ...
%                 ( atan(ysol(2:end)./xsol(2:end)) )) );

            if time < tBest && isreal(time)
                xsolBest = xsol;
                ysolBest = ysol;
                xsolBestRaw = xsolRaw;
                ysolBestRaw = ysolRaw;
                tBest = time;
                dydxScaleBest = dydxScale;
                thetaBest = theta;
                fitIndexBest = fitIndex;
            end
        end
    end
end

%spline fit the best solution
pt = interparc(1e3,xsolBestRaw,ysolBestRaw,'spline');
xsol = pt(1:fitIndexBest+1,1);
ysol = pt(1:fitIndexBest+1,2);
%scale best fit to BCs
xsol = (xsol-xi)*(xf-xi)/(xsol(end)-xi)+xi;
ysol = (ysol-yi)*(yf-yi)/(ysol(end)-yi)+yi;
%interpolate scaled solution
pt = interparc(1e3,xsol,ysol,'spline');
xsol = pt(:,1);
ysol = pt(:,2);
%time = d/v, v=sqrt(E-U)
d = sqrt((ysol(2)-ysol(1))^2+(xsol(2)-xsol(1))^2); %interparc generates equidistant points
tBestSpline = sum( d ./ sqrt(E - ...
    ( (ysol(2:end)-0.5).^2 - xsol(2:end)...
    + 1./sqrt((ysol(2:end)-0.5).^2+(xsol(2:end)-(xf-xi)/2).^2)...
    - 1./sqrt((ysol(2:end)-0.5-0.18*2).^2+(xsol(2:end)-xf).^2) )) );
xsolBestSpline = xsol;
ysolBestSpline = ysol;

plot(xsolBest, ysolBest, '.b')
plot(xsolBestSpline, ysolBestSpline, '.g')
plot([xi xf], [yi yf], 'ob')
fcontour(U2, [0, 1, 0, 1])
csvwrite('trajectory.csv',[xsolBest ysolBest])
csvwrite('trajectory-spline.csv',[xsolBestSpline ysolBestSpline])
warning on