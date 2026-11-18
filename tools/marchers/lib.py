import math
def f(v): 
    s=f"{v:.2f}".rstrip('0').rstrip('.'); return s if s not in ('-0','') else '0'
def smooth(pts, closed=False, t=0.5):
    """Catmull-Rom -> cubic bezier path"""
    n=len(pts)
    if n<2: return ''
    P=pts[:]
    d=f"M{f(P[0][0])} {f(P[0][1])}"
    rng = range(n) if closed else range(n-1)
    for i in rng:
        p0=P[(i-1)%n] if (closed or i>0) else P[i]
        p1=P[i]; p2=P[(i+1)%n]
        p3=P[(i+2)%n] if (closed or i+2<n) else P[(i+1)%n]
        c1=(p1[0]+(p2[0]-p0[0])*t/3, p1[1]+(p2[1]-p0[1])*t/3)
        c2=(p2[0]-(p3[0]-p1[0])*t/3, p2[1]-(p3[1]-p1[1])*t/3)
        d+=f"C{f(c1[0])} {f(c1[1])} {f(c2[0])} {f(c2[1])} {f(p2[0])} {f(p2[1])}"
    if closed: d+='Z'
    return d
def limb(spine, closed=True):
    """spine: [(x,y,w)] -> closed outline"""
    L=[];R=[]
    n=len(spine)
    for i,(x,y,w) in enumerate(spine):
        a=spine[max(i-1,0)]; b=spine[min(i+1,n-1)]
        dx,dy=b[0]-a[0],b[1]-a[1]; l=math.hypot(dx,dy) or 1
        nx,ny=-dy/l,dx/l
        L.append((x+nx*w/2,y+ny*w/2)); R.append((x-nx*w/2,y-ny*w/2))
    return smooth(L+R[::-1], closed=closed)
def limb_sides(spine):
    L=[];R=[]; n=len(spine)
    for i,(x,y,w) in enumerate(spine):
        a=spine[max(i-1,0)]; b=spine[min(i+1,n-1)]
        dx,dy=b[0]-a[0],b[1]-a[1]; l=math.hypot(dx,dy) or 1
        nx,ny=-dy/l,dx/l
        L.append((x+nx*w/2,y+ny*w/2)); R.append((x-nx*w/2,y-ny*w/2))
    return smooth(L), smooth(R), L, R
def circle(cx,cy,r):
    return f"M{f(cx-r)} {f(cy)}a{f(r)} {f(r)} 0 1 0 {f(2*r)} 0a{f(r)} {f(r)} 0 1 0 {f(-2*r)} 0"
def hatch(x0,y0,x1,y1,n,dx=0,dy=0):
    """n parallel strokes from (x0,y0)-(x1,y1), offset by (dx,dy) each"""
    return ''.join(f"M{f(x0+i*dx)} {f(y0+i*dy)}L{f(x1+i*dx)} {f(y1+i*dy)}" for i in range(n))
