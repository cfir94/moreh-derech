import math, json
from lib import *
W1,W2,W3=1.15,0.7,0.42
ink=[]; wash=[]; A=[]; B=[]; washA=[]; washB=[]
def I(d,w=W1,fill=False,L=ink): L.append({"d":d,"w":w,**({"fill":1} if fill else {})})
# ---- spear (behind the hand, drawn first)
I("M84 13V177",1.0)
I("M84 0C86.6 4 86.8 8.4 84.6 12.4H83.4C81.2 8.4 81.4 4 84 0Z",W1)
I("M84 2.5V11.5",W3)
I("M82.8 12.4h2.4v2.4h-2.4z",W2)
# ---- shield on the far arm, seen past his back
cx,cy,r=39,80,20
def arcpts(r,xe=48.6):
    c=(xe-cx)/r; s=math.sqrt(1-c*c); return (xe,cy-r*s),(xe,cy+r*s)
(p,q)=arcpts(20); I(f"M{f(p[0])} {f(p[1])}A20 20 0 1 0 {f(q[0])} {f(q[1])}")
wash.append({"d":f"M{f(p[0])} {f(p[1])}A20 20 0 1 0 {f(q[0])} {f(q[1])}Z","c":"orange"})
(p,q)=arcpts(15.5); I(f"M{f(p[0])} {f(p[1])}A15.5 15.5 0 1 0 {f(q[0])} {f(q[1])}",W2)
I(circle(cx,cy,3.4)); I(circle(cx,cy,1.3),W2)
studs=''.join(circle(cx+17.7*math.cos(math.radians(a)),cy+17.7*math.sin(math.radians(a)),0.55) for a in range(115,250,15))
I(studs,W2)
# concentric shading, lower-left
I(hatch(25.5,84,28.5,81,6,1.3,2.0),W3)
# ---- hair bunched at the nape, rows of curls
I(smooth([(51,21),(48.6,27),(48.2,34),(50,40.5),(55,42.6),(58.6,40.6),(58.2,33)]),W1)
I(''.join(circle(x,y,0.8) for y in (30,33.6,37.2) for x in (50.4+((y*10)%2),52.6+((y*10)%2),54.8+((y*10)%2))),W3)
# ---- helmet: pointed cap with a rim band and a neck flap
I("M59.6 1.4C57.6 7 55 13.6 50.4 20.6H71.2C67 14 62.6 7 61.2 1.4Z")
wash.append({"d":"M59.6 1.4C57.6 7 55 13.6 50.4 20.6H71.2C67 14 62.6 7 61.2 1.4Z","c":"stone"})
I("M50.4 20.6L50 23.4H71.6L71.2 20.6",W1)
I("M54.6 13.2C58.6 12.4 63 12.4 67 13.4M57 8.4C59.4 7.9 61.6 7.9 63.6 8.4",W3)
I(hatch(52.5,19.8,55.8,14.6,4,1.4,0),W3)
# ---- face, in profile
I(smooth([(70.6,23.4),(71.6,25.4),(72.2,27.6),(74.4,30.4),(76,31.8),(74.2,32.8),(72.4,33)]),W1)
I("M72.4 33C72.9 33.7 72.8 34.3 71.8 34.6C72.6 35 72.7 35.8 71.6 36.4",W2)
# eye: the big almond eye of the reliefs
I("M63.4 27.4C64.8 25.7 67.8 25.5 69.4 26.9C67.8 28.3 65 28.5 63.4 27.4Z",W2)
I(circle(67.2,27,0.95),W2,True)
I("M62.6 24.8C65.4 23.4 68.6 23.6 70.6 24.9",1.5)
I("M65.6 29.6C67 30.4 68.6 30.6 70 30.2",W3)
# ear
I("M57.8 24.8C55.2 24.4 54.4 28.2 55.4 30.4C56 31.8 57.8 31.6 58 30.2",W2)
I("M56.8 26.6C56 27.4 56.2 28.6 57 29.2",W3)
# moustache with curled ends
I("M72.4 33C70.4 33.2 68.8 34.4 68 36.4C69.6 36.4 70.8 35.6 71.4 34.6",W2)
# ---- the beard: square, in rows of tight curls
beard="M58.6 31.2C57.8 37 57.4 45 58.4 53.2L72.4 54C73 47.6 72.4 41.4 71.4 36.6"
I(beard,W1); wash.append({"d":beard+"Z","c":"stone"})
I(''.join(f"M{f(x)} 31.2c-.6 1.4.6 2.2 0 3.4s.6 2.2 0 3.2" for x in (60,61.8,63.6)),W3)
curls=''
for j,y in enumerate((39.6,42.8,46,49.2,52.2)):
    for k in range(7):
        x=59.8+k*1.9+(0.95 if j%2 else 0)
        if x<71.6: curls+=f"M{f(x+0.8)} {f(y)}a.8 .8 0 1 1-.8-.8"
I(curls,W2)
# ---- neck and torso in scale armour
I("M59 53.6L58.4 57M70.8 54L71 57",W2)
torso_back=smooth([(50.4,56.6),(48.2,66),(47.8,80),(48.6,93)])
torso_front=smooth([(74.2,81),(72.6,86),(72.6,93)])
I(torso_back); I(torso_front)
I("M50.4 56.6C55 54.6 61 54 65.6 54.6",W1)
wash.append({"d":"M50.4 56.6C56 54.4 64 54 70.6 55.6C74.6 62 75 72 72.4 82L72.6 93H48.6C47.8 80 48.2 66 50.4 56.6Z","c":"sand"})
sc=''
for j in range(10):
    y=59+j*3.3; off=(1.15 if j%2 else 0)
    x=50.6+off
    xe=63.4+(y-58)*0.1
    while x<min(71.4,xe):
        sc+=f"M{f(x)} {f(y)}q1.15 1.9 2.3 0"; x+=2.3
I(sc,W3)
# belt
I("M48.4 93H72.8M48.3 99.2H73.2",W1); I("M48.4 93L48.3 99.2M72.8 93L73.2 99.2",W2)
I("M51 96.1h20",W3)
wash.append({"d":"M48.4 93H72.8L73.2 99.2H48.3Z","c":"red"})
# kilt with the overlapping edge and a fringe
I(smooth([(48.3,99.2),(47.8,108),(47.6,119.6)]),W1); I(smooth([(73.2,99.2),(74.4,108),(75.2,119.6)]),W1)
I("M47.6 119.6C56 120.6 66 120.8 75.2 119.6",W1)
I("M71.6 99.4L61 119.8",W2)
I(''.join(f"M{f(x)} 120.2v3.6" for x in [48.6+i*1.65 for i in range(17)]),W3)
I(hatch(50,102,50,117,4,2.6,0),W3)
wash.append({"d":"M48.3 99.2H73.2C74.4 108 75.2 119.6 75.2 119.6C66 120.8 56 120.6 47.6 119.6C47.6 119.6 47.8 108 48.3 99.2Z","c":"sand2"})
# ---- the near arm, gripping the spear
UA=[(68.4,57.8,10.4),(69.4,70,8.8),(70.4,80.6,7.6)]
l1,r1,_,_=limb_sides(UA); I(l1,W1); I(r1,W1)
FA_=[(70.2,83,7.2),(75.6,80.6,6.2),(81,77.2,5.2)]
l2,r2,_,_=limb_sides(FA_); I(l2,W1); I(r2,W1)
I("M66.8 80.4C66.6 85.2 71.8 87.6 74.4 83.2",W1)  # the elbow
I("M63.6 67.8C66.6 66.6 70.8 66.8 74 68.2",W2)  # sleeve edge, with a short fringe
I(''.join(f"M{f(x)} {f(67.6-(x-63.6)*0.0)}v1.6" for x in [64.4,65.8,67.2,68.6,70,71.4,72.8]),W3)
I("M69.6 74C70.4 76 70.6 78.2 70 80.2",W3)   # the biceps
I("M78.6 74.2L79.6 79.6M77.2 74.8L78.2 80.2",W2) # bracelet
wash.append({"d":"M64.2 68.6C66.6 67.8 71 67.8 73.8 69L74.6 82.6C76 81.8 80 78.6 81.2 74.6L81.8 79.8C78 82.6 74.6 86.6 71 86.4C67.4 86 66.4 83 66.6 80Z","c":"skin"})
# fist around the shaft
I("M81 72.4C82.4 71 86.4 71 87.2 72.6L87.6 77.6C86.6 79 82.6 79.2 81.4 78Z",W1)
I("M84.6 73.6h2.6M84.6 75.2h2.8M84.6 76.8h2.6",W3)
I("M81.4 72.6C82.6 73.4 83.6 73.4 84.6 72.4",W2)  # thumb
wash.append({"d":"M81 72.4C82.4 71 86.4 71 87.2 72.6L87.6 77.6C86.6 79 82.6 79.2 81.4 78Z","c":"skin"})
# ---- legs, two frames
def leg(hip,knee,calf,ankle):
    return limb_sides([hip,knee,calf,ankle])
def boots(sp,L):
    return
def frame(front,back,ff,bf,L,WL):
    for sp in (back,front):
        a,b,_,_=limb_sides(sp); I(a,W1,L=L); I(b,W1,L=L)
        # the boot top and its lacing
        x,y,w=sp[-2]; I(f"M{f(x-w/2-0.2)} {f(y+2)}h{f(w+0.6)}",W2,L=L)
        ax,ay,aw=sp[-1]
        I(f"M{f(x-1.6)} {f(y+4)}l3.2 2.6M{f(x+1.4)} {f(y+4)}l-3.2 2.6M{f(x-1.4)} {f(y+8)}l3 2.4M{f(x+1.4)} {f(y+8)}l-3 2.4",W3,L=L)
        # knee and calf modelling
        kx,ky,kw=sp[1]; I(f"M{f(kx-1.2)} {f(ky-1)}c.8 .9 1.8.9 2.4 0",W3,L=L)
    I(ff,W1,L=L); I(bf,W1,L=L)
FA=[(65.6,119,10.4),(70.4,141,7.4),(72.4,152,8.2),(75.8,166,5.4)]
BA=[(55,119,10.4),(51.8,141,7.4),(49.6,152,8.2),(46,165,5.4)]
ffA="M73.2 167.4L72.6 173.6H86.6C87.8 172 85.4 169.6 80.6 168.4L78.4 164.6"
bfA="M43.4 162.4L42.4 169.8C45.4 172.8 50.4 174.4 54.2 173.6C52.4 171 49.4 168.4 48.6 164"
frame(FA,BA,ffA,bfA,A,washA)
FB=[(66.6,119,10),(67.4,141,7.2),(67,152,8),(66.4,166,5.4)]
BB=[(55.6,119,10),(54,141,7.2),(53.2,152,8),(52.4,164.4,5.4)]
ffB="M63.8 167.6L63.4 173.6H77C78 172 75.8 169.8 71.4 168.6L69.2 164.8"
bfB="M49.8 165.6L49.6 172C52.6 173.6 57 173.8 60.4 173.2C58.8 171 56.6 169.4 55 165.6"
frame(FB,BB,ffB,bfB,B,washB)
json.dump({"ink":ink,"wash":wash,"a":A,"b":B},open('assyrian.json','w'))
print(len(json.dumps(ink)))
