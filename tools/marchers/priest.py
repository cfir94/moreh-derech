import math, json
from lib import *
W1,W2,W3=1.15,0.7,0.42
ink=[]; wash=[]; A=[]; B=[]; WA=[]; WB=[]
def I(d,w=W1,fill=False,L=ink): L.append({"d":d,"w":w,**({"fill":1} if fill else {})})
# ---- the turban (migba'at), wound linen
tur="M53.6 21.4C52 12.6 56.6 5.6 64 5.2C71.4 4.8 75.4 11 74.4 19.8C68 22.4 59.8 23 53.6 21.4Z"
I(tur); wash.append({"d":tur,"c":"white"})
for k in range(4):
    y=9.6+k*3.2
    I(f"M{f(54.2+k*0.2)} {f(y+2.6)}C{f(60)} {f(y+0.4)} {f(68)} {f(y-0.6)} {f(74.4-k*0.1)} {f(y+0.6)}",W2)
I("M62 5.6C63.6 4 66 4 67.4 5.4",W2)
# ---- face, with the long beard and side hair
I(smooth([(73.6,20.6),(74.2,23.2),(74.6,25.4),(76.8,28.6),(78.2,30),(76.4,30.8),(74.8,31)]),W1)
I("M69 25.4C70 24 72.4 23.8 73.6 25C72.4 26.2 70.2 26.4 69 25.4Z",W2)
I(circle(71.8,25.1,0.75),W2,True)
I("M68.2 23.2C70.2 22.2 72.6 22.4 74 23.2",1.3)
I("M71.4 28.4C72.4 29.4 73.8 29.8 75 29.6",W3)
# ear, half under the turban
I("M60.4 22.6C58.6 22.6 58 25.6 58.8 27.4C59.4 28.6 60.8 28.4 61 27.2",W2)
# hair falling behind the ear in waves
I("M54 21.6C53 26 53.6 30.6 56 34.4M56.4 22.2C55.8 26 56.4 29.6 58.4 32.6",W2)
# moustache and the beard, long and wavy, down onto the chest
I("M74.8 31C72.8 31.2 71.2 32.4 70.4 34.2",W2)
beard="M60.8 28.4C59.4 34 59.2 40 60.6 46C62 50.6 64.4 53.6 67.2 55C68 52 69.4 50.6 71.4 49C73.4 45 74.4 39.6 74 34.6L74.8 31"
I(beard,W1); wash.append({"d":beard+"Z","c":"stone"})
I(''.join(f"M{f(x)} 31.6c-1 3 1 5.4 0 8.4s1 5.4 0 8.2" for x in (62.4,64.6,66.8,69,71.2)),W3)
I("M71.4 33.6c-.8.4-1.6 1-2.2 1.8",W3)
wash.append({"d":"M67.6 21.4L73.6 20.6C74.2 24 77.4 28 78.2 30L74.8 31L74 34.6L60.8 34.4L60.8 28.4L61 21.8Z","c":"skin"})
# ---- the linen tunic (ketonet), long-sleeved, to the ankles
I(smooth([(57.6,50),(54.4,60),(53,74),(52.6,88)]),W1)
I("M57.6 50C60 48.6 62.6 48.4 64.4 49.4",W1)
wash.append({"d":"M57.6 50C62 47.6 70 48 74 51.6L76.4 88.2H52.6C53 74 54.4 60 57.6 50Z","c":"white"})
# the long folds of the linen above the sash
I("M58.6 58c-.8 8-.8 16 .2 26M61.6 58.4c-.4 7.6-.2 15.4.6 25.8",W3)
# ---- the sash (avnet): wound several times, in blue, purple and scarlet, with long hanging ends
for k in range(4):
    y=86+k*2.4
    I(f"M{f(52.4)} {f(y)}C60 {f(y+1)} 68 {f(y+1)} 76.6 {f(y-0.2)}",W1 if k in (0,3) else W2)
wash.append({"d":"M52.4 86C60 87 68 87 76.6 85.8L76.8 93C68 94 60 94 52.2 93.2Z","c":"blue"})
I(hatch(55,87.4,55,89.4,8,2.6,0),W3)
ends="M57.6 93.6C57 101 57.2 108 58.4 115.6L61.6 115.2C60.6 108 60.4 101 61 93.6"
I(ends,W1); wash.append({"d":ends+"Z","c":"red"})
I("M58.4 115.6l.2 2.4M59.8 115.4l.2 2.6M61.2 115.2l.2 2.4",W3)
I("M57.8 100.4h3.2M58 106.6h3.2",W3)
# ---- the near arm, long sleeve, carrying the fire-pan forward
UA=[(68.6,52,11),(70.2,64,9.6),(71.4,75.4,8.4)]
l1,r1,_,_=limb_sides(UA); I(l1,W1); I(r1,W1)
FA_=[(71.2,78,8),(76.6,76.6,7),(81.4,74.4,6.2)]
l2,r2,_,_=limb_sides(FA_); I(l2,W1); I(r2,W1)
I("M67.2 75.4C67 80.6 72.4 83.2 75 78.6",W1)
I("M80.6 70.8C79.6 73 79.6 76 80.8 78.4",W2)  # the cuff
I("M66 60c.6 4 .8 8 .4 12",W3)
wash.append({"d":"M63.6 52.6C66 50 72 50.4 73.8 53.6L75 75.4C77 74.4 80 72.2 81 70.8L81.6 78.2C78 80.8 74.8 82.6 71.4 82.4C68 82 66.6 79 66.8 75.4Z","c":"white"})
# hand and the fire-pan (machta) with glowing coals and a wisp of smoke
I("M81.4 71.6C83 70.4 85.6 70.8 86.4 72.6C86.8 74.6 85.4 76.6 83 76.8C81.8 76.6 81.2 74.2 81.4 71.6Z",W1)
wash.append({"d":"M81.4 71.6C83 70.4 85.6 70.8 86.4 72.6C86.8 74.6 85.4 76.6 83 76.8C81.8 76.6 81.2 74.2 81.4 71.6Z","c":"skin"})
I("M85.8 73.4L90.4 71.4",W1)
pan="M89.4 68.4H101.4L99.8 73.2C96.8 74.6 93.8 74.6 91 73.2Z"
I(pan,W1); wash.append({"d":pan,"c":"stone"})
I("M90.2 68.4C91.4 66.6 92.8 67.6 94 66.4C95.2 67.6 96.6 66.6 97.8 67.8C99 66.8 100.2 67.4 100.8 68.4",W2)
wash.append({"d":"M90.2 68.4C91.4 66.6 92.8 67.6 94 66.4C95.2 67.6 96.6 66.6 97.8 67.8C99 66.8 100.2 67.4 100.8 68.4Z","c":"orange"})
I(hatch(91.4,70,92.6,72.4,5,1.8,0),W3)
I("M95 64.2c-1.4-2 1.4-3.4 0-5.6s1.4-3.4 0-5.4M97.6 63.6c-1.2-1.8 1.2-3 0-4.8",W3)
# ---- the hem swings with the stride; bare feet under it (the priests served barefoot)
def frame(front_edge, back_edge, hem, folds, feet, L, WL):
    I(front_edge,W1,L=L); I(back_edge,W1,L=L); I(hem,W1,L=L); I(folds,W3,L=L)
    for ft in feet: I(ft,W1,L=L)
    WL.append({"d":back_edge.replace('M','M',1)+"L"+front_edge.split('M')[1].split('C')[0][::-1][::-1]+"Z","c":"white"})
# frame A: stride
feA=smooth([(76.6,93),(78.6,120),(81.6,146),(84.4,164)])
beA=smooth([(52.2,93),(50.4,120),(46.6,146),(43.4,162.6)])
hemA="M43.4 162.6C56 166.4 72 167 84.4 164"
foldsA="M60 96l-2.4 66M66.6 96l1.2 69M71.6 96l4.4 68M55 120l-4 42"
feetA=["M76.4 166.4L76.2 171.6H87.6C88.6 170 86.6 168 83.4 167.2","M78.6 171.6v-1.8M80.4 171.6v-1.6M82.2 171.6v-1.4",
       "M45.4 165.4L44.4 170.4C47 172.6 51.4 173.6 54.4 172.8C53 170.8 50.6 168.8 49.6 166"]
I(feA,W1,L=A); I(beA,W1,L=A); I(hemA,W1,L=A); I(foldsA,W3,L=A)
for ft in feetA: I(ft,W2 if 'v-' in ft else W1,L=A)
WA.append({"d":"M52.2 93H76.6C78.6 120 81.6 146 84.4 164C72 167 56 166.4 43.4 162.6C46.6 146 50.4 120 52.2 93Z","c":"white"})
# frame B: feet passing
feB=smooth([(76.6,93),(77.4,120),(77.8,146),(77.6,166)])
beB=smooth([(52.2,93),(51.6,120),(51.2,146),(51.4,166)])
hemB="M51.4 166C60 167.8 70 168 77.6 166"
foldsB="M60 96l-1 69M66.6 96l.6 71M71.6 96l1.6 70M55.4 120l-.6 44"
feetB=["M68.6 168L68.4 172.6H79.2C80.2 171 78.2 169.2 75 168.4","M70.8 172.6v-1.6M72.6 172.6v-1.4M74.4 172.6v-1.4",
       "M55.6 168.4L55.4 172.6H65.8C66.6 171 64.6 169.4 61.6 168.6"]
I(feB,W1,L=B); I(beB,W1,L=B); I(hemB,W1,L=B); I(foldsB,W3,L=B)
for ft in feetB: I(ft,W2 if 'v-' in ft else W1,L=B)
WB.append({"d":"M52.2 93H76.6C77.4 120 77.8 146 77.6 166C70 168 60 167.8 51.4 166C51.6 146 51.6 120 52.2 93Z","c":"white"})
json.dump({"ink":ink,"wash":wash,"a":A,"b":B,"washA":WA,"washB":WB},open('priest.json','w'))
