"""
The marching figures, drawn the way the site's other drawings are (decor/games.tsx: the two monks of
the robes game): a 64 grid, one pen line of 1.8 through the ink64 wobble, flat fills in the site's
own colours, and a body about four heads tall. Faces get just enough: an eye, a brow, a nose, a beard.

Each figure: body (static), a and b (the two frames of a step; drawn under the body, so a kilt or a
robe hem covers the tops of the legs). A path is {d, w (stroke width, 0 = none), f (fill key),
fo (fill opacity), s (stroke colour key), o (opacity)}.
"""
from lib import smooth, limb, circle, f as num

def P(L, d, w=1.8, f=None, fo=None, s=None, o=None):
    p = {"d": d}
    if w != 1.8: p["w"] = w
    if f: p["f"] = f
    if fo is not None: p["fo"] = fo
    if s: p["s"] = s
    if o is not None: p["o"] = o
    L.append(p)

def face(L, eye, brow=True):
    x, y = eye
    P(L, f"M{num(x-1.6)} {num(y+.1)}c.7-.8 2.1-.9 2.9-.1-.8.7-2.1.8-2.9.1z", w=0.9, f="paint")
    P(L, circle(x, y, 0.55), w=0, f="dark")
    if brow: P(L, f"M{num(x-2.2)} {num(y-1.4)}c1.2-.6 2.6-.6 3.8 0", w=1.4)

def fist(L, x, y):
    P(L, circle(x, y, 2.3), w=1.5, f="skin")
    P(L, f"M{num(x+.3)} {num(y-1.4)}v2.8M{num(x+1.4)} {num(y-1.1)}v2.2", w=0.8)

# ------------------------------------------------------------------ the Assyrian spearman (Lachish)
def assyrian():
    B, A, Bb = [], [], []
    # the two frames: legs and boots, under the kilt
    for L, back, front, bb, fb in (
        (A, [(28.6, 52, 4.8), (27, 55.6, 4.3), (25.4, 57.6, 3.9)], [(36.8, 52, 4.8), (39, 55.6, 4.3), (40.6, 57.6, 3.9)],
         "M23.4 56L22.6 59.6C24.2 60.6 27.2 60.8 29.4 60.4C28.8 59.2 27.8 58.2 27.4 56.6Z",
         "M38.6 56L38.8 60.4H45.4C45.8 59 44.4 58 42.6 57.6L42.2 55.8Z"),
        (Bb, [(29.6, 52, 4.8), (29.2, 55.6, 4.3), (28.8, 57.6, 3.9)], [(36, 52, 4.8), (36.4, 55.6, 4.3), (36.6, 57.6, 3.9)],
         "M26.8 56.2L26.8 60.4H33.2C33.6 59.2 32.2 58.2 30.6 57.8L30.6 56Z",
         "M34.6 56L34.6 60.4H41.2C41.6 59 40.2 58 38.4 57.6L38.4 55.8Z"),
    ):
        P(L, limb(back), f="skin"); P(L, bb, f="sign")
        P(L, limb(front), f="skin"); P(L, fb, f="sign")
    # spear, behind everything but the hand
    P(B, "M48.5 9.5V61", w=1.6)
    P(B, "M48.5 1.2c2.2 2.8 2.2 6 0 8.6-2.2-2.6-2.2-5.8 0-8.6z", w=1.4, f="paint")
    P(B, "M48.5 3v5.2", w=0.9)
    # the round shield on the far arm
    P(B, circle(19.5, 35, 10.6), f="orange", fo=0.85)
    P(B, circle(19.5, 35, 7.4), w=1, o=0.8)
    P(B, circle(19.5, 35, 2.2), w=1.4, f="stone")
    import math
    P(B, "".join(f"M{num(19.5+9.1*math.cos(math.radians(a)))} {num(35+9.1*math.sin(math.radians(a)))}h.1" for a in range(90, 300, 30)), w=2.2)
    P(B, "M13.4 39.4l2-2M12.6 36.6l2.4-2.4M14.4 41.6l1.8-1.8", w=1, o=0.7)
    # torso in scale armour
    P(B, "M24.8 30.6C27.6 28.6 38 28.4 40.6 30.4L41 42H24.4Z", f="stone")
    sc = ""
    for j, y in enumerate((32.6, 35, 37.4, 39.8)):
        x = 25.8 + (1 if j % 2 else 0)
        while x < 35.4:
            sc += f"M{num(x)} {num(y)}q1 1.6 2 0"; x += 2
    P(B, sc, w=0.9, o=0.75)
    P(B, "M24.4 41.8H41.2V44.6H24.4Z", f="red")
    P(B, "M24.4 44.6H41.2L42 52.4C36 53.4 30 53.4 23.6 52.4Z", f="paint")
    P(B, "M39.6 44.8L33 52.8", w=1.1)
    P(B, "".join(f"M{num(24.4+i*1.45)} {num(53 if 2 < i < 11 else 52.6)}v1.8" for i in range(13)), w=0.9)
    # hair gathered at the nape, in rows of curls
    P(B, "M29.2 19.4C26 19.6 24.6 22.6 25 25.6C25.4 28.4 27.6 29.8 30 29.2L30.6 19.6Z", f="dark")
    P(B, "".join(f"M{num(x+.6)} {num(y)}a.6 .6 0 1 1-.6-.6" for y in (22.6, 25, 27.4) for x in (26.6, 28.4)), w=0.7, s="stone")
    # the face
    P(B, "M29.8 19.4H37.6C37.9 20.6 38.1 21.6 38.3 22.2L40.3 24.6L38.5 25.2C38.7 26 38.5 26.6 37.7 26.8L37.5 28H30.2Z", f="skin")
    P(B, "M31.6 21.2c-1.4 0-1.8 2.2-1 3.2.5.6 1.4.4 1.5-.4", w=1.1)
    face(B, (35.4, 22.1))
    # the square beard, black, with rows of tight curls
    P(B, "M30.4 24.4C30.2 27.2 30.4 30 31 32.6H38.6C39 30.6 38.8 28.6 38.2 26.8L37.8 26.8C37 26.2 35.6 25.6 34.4 25.2Z", f="dark")
    P(B, "".join(f"M{num(x+.6)} {num(y)}a.6 .6 0 1 1-.6-.6" for y in (28.4, 30.4, 32.2) for x in (32, 33.8, 35.6, 37.4) if not (y < 29 and x > 37)), w=0.7, s="stone")
    P(B, "M38.4 25C36.8 25 35.4 25.8 34.8 27C36.2 27 37.6 26.6 38.4 25.8Z", w=1, f="dark")
    # the pointed helmet and its rim
    P(B, "M28.6 19.2L33.4 5.4L38.2 19.2Z", f="stone")
    P(B, "M30.6 16.6l1.4-4M32.4 17.2l1.4-4", w=1, o=0.7)
    P(B, "M27.8 18.4H39V20.8H27.8Z", f="stone")
    # the near arm: a short sleeve, then the forearm forward to the spear
    P(B, limb([(38.4, 33.2, 4.6), (39.2, 37.4, 4.2), (43.4, 36.4, 3.8), (46.4, 35, 3.4)]), f="skin")
    P(B, "M35.6 30.2C37.8 29 40.4 29.4 41.4 31.2L41.6 34.6C39.8 35.4 37.6 35.4 35.8 34.6Z", f="stone")
    P(B, "M44 34.4l.8 3.2M45.2 34l.8 3", w=1)
    fist(B, 48.3, 34.8)
    P(B, "M18 61.4c9-1 22-1 31 0", w=1.2, o=0.55)
    return B, A, Bb

# ------------------------------------------------------------------ the Roman legionary (1st century)
def roman():
    B, A, Bb = [], [], []
    for L, back, front, bb, fb, sb, sf in (
        (A, [(28.8, 52, 4.8), (27.2, 55.6, 4.3), (25.6, 57.6, 3.9)], [(37, 52, 4.8), (39.2, 55.6, 4.3), (40.8, 57.6, 3.9)],
         "M23.6 57.6L22.8 59.8C24.4 60.8 27.4 61 29.6 60.6C29 59.6 28 58.8 27.6 57.8Z",
         "M38.8 58L39 60.4H45.6C46 59.2 44.6 58.4 42.8 58L42.6 57.6Z",
         "M23.8 55.4l3.6 1.2M24.4 53.6l3.4 1.2", "M38.4 55l3.4-.8M37.8 53.4l3.4-.8"),
        (Bb, [(29.8, 52, 4.8), (29.4, 55.6, 4.3), (29, 57.6, 3.9)], [(36.2, 52, 4.8), (36.6, 55.6, 4.3), (36.8, 57.6, 3.9)],
         "M27 58L27 60.4H33.4C33.8 59.4 32.4 58.6 30.8 58.2L30.8 57.8Z",
         "M34.8 58L34.8 60.4H41.4C41.8 59.2 40.4 58.4 38.6 58L38.6 57.6Z",
         "M27.2 55.4h4M27.4 53.6h4", "M34.4 55.4h4M34.4 53.6h4"),
    ):
        P(L, limb(back), f="skin"); P(L, bb, f="sign"); P(L, sb, w=1, s="sign")
        P(L, limb(front), f="skin"); P(L, fb, f="sign"); P(L, sf, w=1, s="sign")
    # pilum: wooden shaft, a lead weight, the long iron shank and a small point
    P(B, "M48.5 22V61")
    P(B, "M48.5 5V20.4", w=1.1)
    P(B, "M48.5 1.6L49.9 5.4H47.1Z", w=1, f="stone")
    P(B, "M47.2 20.2h2.6v2.8h-2.6z", w=1, f="sign")
    # scutum on the far arm: curved, red, with boss and thunderbolts
    P(B, "M25.6 25.4H15.8C14.4 25.4 13.6 26.4 13.6 27.8V50C13.6 51.4 14.4 52.4 15.8 52.4H25.6Z", f="red", fo=0.9)
    P(B, "M25.6 27.4H16.6C16 27.4 15.6 27.8 15.6 28.4V49.4C15.6 50 16 50.4 16.6 50.4H25.6", w=0.9, s="gold")
    P(B, "M20.4 29.6l-1.6 3.6 2.4.6-1.4 3M20.4 48l-1.6-3.6 2.4-.6-1.4-3", w=1.1, s="gold")
    P(B, circle(20.4, 38.8, 2.6), w=1.4, f="stone")
    # tunic, belt and the studded apron
    P(B, "M24.8 45H42L42.8 52C36.6 53 30.4 53 24 52Z", f="red", fo=0.9)
    P(B, "M25 51.6l1.2 1 1.2-1 1.2 1 1.2-1", w=0.9, o=0.7)
    P(B, "M41 44.6L45 52.4L43.8 53L39.8 45.2Z", w=1.2, f="sign")
    # lorica segmentata
    P(B, "M25.2 30.4C27.8 28.4 38.6 28.2 41.2 30.2L41.6 43H24.8Z", f="stone")
    P(B, "M25.1 33.4c4.2.8 8.6.9 11.6.6M25 36.4c4.2.8 8.6.9 11.6.6M24.9 39.4c4.2.8 8.6.9 11.6.6", w=1.1)
    P(B, "M24.6 42.8H42V45.2H24.6Z", f="sign")
    P(B, "M27.2 44h.1M30 44h.1M38.6 44h.1", w=1.6, s="paint")
    P(B, "M31 45.2V50.8M33.2 45.2V50.8M35.4 45.2V50.8", w=1.2)
    P(B, "M31 47.4h.1M33.2 47.4h.1M35.4 47.4h.1M31 49.6h.1M33.2 49.6h.1M35.4 49.6h.1", w=1.6, s="gold")
    # neck, the scarf, the face (clean-shaven) and the helmet
    P(B, "M33.6 25.6h4.6v3.4h-4.6z", w=0, f="skin")
    P(B, "M31.4 28.8C33.6 27.4 38.6 27.4 40.8 28.8C40 30.4 38 31.2 36 31.2S32 30.4 31.4 28.8Z", w=1.4, f="paint")
    P(B, "M33.6 17.2H40C40.4 18.6 40.6 19.6 40.8 20.2L42.6 22.4L40.8 23C41 23.8 40.8 24.4 40 24.6C40.2 25.8 39.6 27 38 27.4C36.4 27.8 35 27.2 34 26.2Z", f="skin")
    face(B, (38.6, 20.4))
    P(B, "M38.8 24.8h1.2", w=0.9)
    P(B, "M30.4 18.2C30 11.6 33 8.6 36.6 8.6C40.4 8.6 42.4 11.6 42 17.4C38.4 16.8 34 17 30.4 18.2Z", f="stone")
    P(B, "M30.4 18.2C29.8 20.6 28.4 22 26.6 22.6L27.2 24C29.6 23.6 31.4 22.4 32.4 20.6Z", w=1.5, f="stone")
    P(B, "M35.8 17.2L35.4 23.6C35.4 24.6 36.6 25.2 37.4 24.6L38.8 23.6L38.4 17Z", w=1.5, f="stone")
    P(B, "M31 17.4C34.6 16.2 38.8 16 42.2 16.6", w=1.3)
    P(B, "M33 12l1.2-1.6M34.4 13l1.2-1.6", w=1, o=0.7)
    P(B, "M36.6 8.6V7.2", w=1.4)
    P(B, "M31.4 9.4C33 5.4 39.6 4.6 43 8.2C39.6 7.4 35.6 7.6 31.4 9.4Z", f="red")
    P(B, "M33.8 7.2l-.2 1.2M35.8 6.4l-.1 1.2M37.8 6.2v1.2M39.8 6.4l.2 1.2", w=0.8, o=0.8)
    # the near arm, short red sleeve, carrying the pilum
    P(B, limb([(38.6, 33.6, 4.6), (39.4, 37.6, 4.2), (43.6, 36.4, 3.8), (46.4, 35, 3.4)]), f="skin")
    P(B, "M35.8 30C38 28.8 40.6 29.2 41.6 31L41.8 34.4C40 35.2 37.8 35.2 36 34.4Z", f="red")
    fist(B, 48.3, 34.8)
    P(B, "M18 61.4c9-1 22-1 31 0", w=1.2, o=0.55)
    return B, A, Bb

# ------------------------------------------------------------------ a priest in the Temple (Second Temple)
def priest():
    B, A, Bb = [], [], []
    # the hem swings with the stride; bare feet under it (the priests served barefoot)
    P(A, "M23.6 57.6l-.6 2.6c1.6.8 3.6 1 5.4.6-.4-1-1.2-1.8-2.2-2.4Z", w=1.3, f="skin")
    P(A, "M41.2 57.8c0 1.6.2 2.4.6 2.8h5c.2-1-.8-1.8-2.4-2.2Z", w=1.3, f="skin")
    P(A, "M26.4 45H41.6C42.6 50 43.6 54.4 44.4 58C38 59.2 30.4 59.2 22.8 57.8C24.2 54 25.6 49.6 26.4 45Z", f="paint")
    P(A, "M31 47l-1.6 10.6M35.4 47v11.2M39.4 47l1.6 10.8", w=1, o=0.6)
    P(Bb, "M30.4 58.4c0 1.2.2 1.8.6 2h4.6c.2-.8-.8-1.4-2.2-1.8Z", w=1.3, f="skin")
    P(Bb, "M37.6 58.4c0 1.2.2 2 .6 2.2h5c.2-.8-.8-1.6-2.4-2Z", w=1.3, f="skin")
    P(Bb, "M26.4 45H41.6C42 50 42.2 54.4 42.4 58.6C37 59.6 31 59.6 25.4 58.6C25.8 54.4 26 50 26.4 45Z", f="paint")
    P(Bb, "M30.6 47l-.4 11M34.4 47v11.4M38.4 47l.4 11.2", w=1, o=0.6)
    # the long linen tunic and its folds
    P(B, "M28 29.6C30.6 28 37.4 28 40 29.8L41.6 45H26.4Z", f="paint")
    P(B, "M30.4 32l-.6 8.6M33.4 31.6l-.2 9", w=1, o=0.6)
    # the sash: blue, scarlet and white, wound round, with the long ends hanging
    P(B, "M26.2 40.6H41.8V45.2H26.2Z", f="blue", fo=0.85)
    P(B, "M26.6 42.2H41.4", w=1.2, s="red")
    P(B, "M26.6 43.8H41.4", w=0.9, s="paint")
    P(B, "M29.6 45.2C29.2 49 29.4 52.4 30.2 55.6L32.6 55.2C32 52.2 31.8 48.8 32.2 45.2Z", w=1.5, f="red", fo=0.85)
    P(B, "M30.4 55.8l.2 1.4M31.6 55.6l.2 1.4", w=0.9)
    # hair, the face and a long beard
    P(B, "M29.6 18.4C27.8 19.6 27.6 22.8 28.6 25.4C29.4 27 31 27.2 31.6 25.6Z", w=1.5, f="sign")
    P(B, "M30.6 17.6H39.4C39.8 18.8 40 19.8 40.2 20.4L42 22.6L40.2 23.2C40.4 24 40.2 24.6 39.4 24.8L39.2 26H31Z", f="skin")
    P(B, "M32.6 20.6c-1.3 0-1.7 2-1 3 .5.6 1.3.4 1.4-.4", w=1.1)
    face(B, (37.6, 21.2))
    P(B, "M31.6 23.4C31.2 27.8 31.8 31.8 33.6 34.8C34.8 36.6 36.2 37.4 37.6 37.6C37.8 35.8 38.8 34.4 39.8 33.2C40.8 30.6 40.8 27.6 40.2 25.2L39.6 25C38.2 24.6 36.8 24.4 35.6 24.6Z", f="sign")
    P(B, "M33.6 26.6c-.6 2 .6 3.4 0 5.4M35.6 26.2c-.6 2.2.6 3.8 0 6M37.8 26.6c-.6 2.2.6 3.6 0 5.6", w=0.8, s="paint", o=0.8)
    P(B, "M40.2 25C38.8 25 37.4 25.6 36.6 26.8C38 26.8 39.4 26.4 40.2 25.8Z", w=1, f="sign")
    # the wound turban
    P(B, "M29.6 18.6C29 12.6 31.8 8.4 35.8 8.2C40.2 8 42.6 12.2 41.8 18.4C37.8 19.6 33.6 19.8 29.6 18.6Z", f="paint")
    P(B, "M30 15.6C33.6 14.2 38 14 41.8 14.8M30.4 12.4C33.6 11 37.6 10.8 41.2 11.6", w=1)
    # the long sleeve, and the hand carrying the fire-pan forward
    P(B, limb([(37.4, 31.4, 5.4), (38.6, 36.4, 4.8), (42.4, 36.6, 4.4), (45.4, 35.6, 4)]), f="paint")
    P(B, "M44.2 33.6l.8 4", w=1)
    P(B, circle(47, 35.4, 2.1), w=1.5, f="skin")
    P(B, "M48.6 35.2L51.2 34.2", w=1.5)
    P(B, "M49.8 31.6H58.4L57.4 34.6C55.4 35.6 53 35.6 51 34.6Z", w=1.6, f="stone")
    P(B, "M50.4 31.6C51.2 30.4 52.2 31 53 30.2C53.8 31 54.8 30.4 55.6 31.2C56.4 30.6 57.4 31 57.8 31.6Z", w=1.1, f="orange")
    P(B, "M53.6 29c-1-1.4 1-2.4 0-3.8s1-2.4 0-3.6M56 28.6c-.8-1.2.8-2 0-3.2", w=0.9, o=0.7)
    P(B, "M18 61.4c9-1 24-1 33 0", w=1.2, o=0.55)
    return B, A, Bb


# ------------------------------------------------------------------ a crusader knight (12th century)
def crusader():
    B, A, Bb = [], [], []
    for L, back, front, bb, fb in (
        (A, [(28.8, 52, 4.8), (27.2, 55.6, 4.3), (25.6, 57.6, 3.9)], [(37, 52, 4.8), (39.2, 55.6, 4.3), (40.8, 57.6, 3.9)],
         "M23.6 57.4L22.8 59.8C24.4 60.8 27.4 61 29.6 60.6C29 59.6 28 58.6 27.6 57.6Z",
         "M38.8 57.8L39 60.4H45.6C46 59.2 44.6 58.2 42.8 57.8L42.6 57.4Z"),
        (Bb, [(29.8, 52, 4.8), (29.4, 55.6, 4.3), (29, 57.6, 3.9)], [(36.2, 52, 4.8), (36.6, 55.6, 4.3), (36.8, 57.6, 3.9)],
         "M27 57.8L27 60.4H33.4C33.8 59.4 32.4 58.4 30.8 58L30.8 57.6Z",
         "M34.8 57.8L34.8 60.4H41.4C41.8 59.2 40.4 58.2 38.6 57.8L38.6 57.4Z"),
    ):
        # mail chausses, then the shoes
        P(L, limb(back), f="stone"); P(L, bb, f="sign")
        P(L, limb(front), f="stone"); P(L, fb, f="sign")
    # the lance with its pennon
    P(B, "M48.5 9V61")
    P(B, "M48.5 3.6l1.4 3.6h-2.8z", w=1, f="stone")
    P(B, "M48.5 7.6L40.4 9.4L43 10.8L40.4 12.2L48.5 13.8Z", w=1.3, f="red")
    # the kite shield on the far arm: white, with the red cross
    shield = "M25.6 26H15.8C14.6 26 14 26.8 14 28C14 38 16.2 46 21 53.2C23.4 49.8 25 45.8 25.6 41.2Z"
    P(B, shield, f="paint")
    P(B, "M19.8 28.6V48M15.4 34.4H25.4", w=2.4, s="red")
    # the white surcoat with its red cross, over the mail
    P(B, "M25 30.2C27.6 28.4 38.4 28.2 41 30.2L42.6 52.6C36.4 53.6 30 53.6 23.8 52.6Z", f="paint")
    P(B, "M31.4 31.8V44M26.8 36.6H36", w=2.4, s="red")
    P(B, "M24.4 42.6H41.8V44.6H24.4Z", w=1.4, f="sign")
    P(B, "M33 44.8V53", w=1)
    P(B, "M25.4 50.4l1.6 1.4M39.6 50.6l1.4 1.2", w=0.9, o=0.6)
    # the mail coif around the face, the face, a short beard
    P(B, "M30 18.6C29.2 22.4 29.4 27 30.8 30.2H39.6C40.4 27.8 40.4 25.2 40 23L40 18.6Z", f="stone")
    P(B, "M31 22.6h1.6M30.8 25h1.6M31 27.4h1.6", w=0.9, o=0.7)
    P(B, "M34 19.6H40.2C40.6 20.8 40.8 21.8 41 22.4L42.8 24.4L41 25C41.2 25.8 41 26.4 40.2 26.6C40.4 27.6 39.8 28.4 38.4 28.6C37 28.8 35.4 28.2 34.4 27.2Z", f="skin")
    P(B, "M35 26.2C35.6 28.4 37 29.6 38.6 29.6C39.6 29.4 40.2 28.6 40.4 27.6C39.2 27.8 38 27.6 37 26.8Z", w=1, f="sign")
    face(B, (38.8, 22.4))
    # the conical helmet with its nasal
    P(B, "M30.4 19.6C30.4 13 33.4 9.6 36.2 8.4C39.4 9.8 41.6 13.2 41.6 19.2C38 18.6 34 18.8 30.4 19.6Z", f="stone")
    P(B, "M30.6 19.2C34 18.2 38 18 41.4 18.8", w=1.3)
    P(B, "M40.6 18.8L41 23.8", w=1.9)
    P(B, "M33.2 14.4l1.4-1.6M34.6 15.6l1.4-1.6", w=1, o=0.7)
    # the arm in mail, holding the lance
    P(B, limb([(38.6, 33.4, 4.8), (39.4, 37.6, 4.4), (43.6, 36.4, 3.9), (46.4, 35, 3.5)]), f="stone")
    P(B, "M35.8 30.4C38 29.4 40.4 29.8 41.4 31.4L41.6 34.2C39.8 35 37.8 35 36 34.2Z", w=1.5, f="paint")
    fist(B, 48.3, 34.8)
    P(B, "M18 61.4c9-1 22-1 31 0", w=1.2, o=0.55)
    return B, A, Bb

# ------------------------------------------------------------------ a Nabataean caravan trader (Petra, Avdat)
def nabataean():
    B, A, Bb = [], [], []
    for L, back, front, bb, fb, sb, sf in (
        (A, [(28.8, 52, 4.6), (27.2, 55.6, 4.1), (25.6, 57.6, 3.7)], [(37, 52, 4.6), (39.2, 55.6, 4.1), (40.8, 57.6, 3.7)],
         "M23.4 59.2L22.8 60.4C24.6 61 27.4 61.2 29.6 60.8L29 59.4Z", "M38.8 59.6V60.6H45.8C46 59.8 45.2 59.4 44 59.4Z",
         "M24.4 57.4l2.6 1.2", "M39.2 57.6l2.8-.6"),
        (Bb, [(29.8, 52, 4.6), (29.4, 55.6, 4.1), (29, 57.6, 3.7)], [(36.2, 52, 4.6), (36.6, 55.6, 4.1), (36.8, 57.6, 3.7)],
         "M27 59.6V60.6H33.6C33.8 59.8 33 59.4 31.8 59.4Z", "M34.8 59.6V60.6H41.8C42 59.8 41.2 59.4 40 59.4Z",
         "M27.4 57.8h3.2", "M35 57.8h3.2"),
    ):
        P(L, limb(back), f="skin"); P(L, bb, w=1.3, f="sign"); P(L, sb, w=1, s="sign")
        P(L, limb(front), f="skin"); P(L, fb, w=1.3, f="sign"); P(L, sf, w=1, s="sign")
    # the walking staff
    P(B, "M48.5 61V15.6c0-2.2 1.6-3.6 3.4-3.4", w=1.9)
    # the red cloak hanging down his back
    P(B, "M26.2 29.8C23.2 33.6 22 42.6 22.8 52.4L26.4 52.8L27 30.4Z", f="red", fo=0.85)
    # the ochre tunic with its dark stripes, a belt and a purse for the incense money
    P(B, "M25.6 30.2C28.2 28.4 38.2 28.2 40.8 30.2L42 52.4C36 53.4 30 53.4 24.6 52.4Z", f="orange", fo=0.7)
    P(B, "M29.4 30.4L28.6 52.8M36.4 30.2L37.2 53", w=1.5, s="sign", o=0.85)
    P(B, "M24.8 43.4C30 44.4 36 44.4 41.4 43.4", w=2, s="sign")
    P(B, "M38.4 44.6c-1.6 0-2.4 1.4-2.2 3.2.2 1.6 1.4 2.6 2.8 2.4s2.2-1.4 2-3c-.2-1.6-1.2-2.6-2.6-2.6Z", w=1.3, f="sign")
    P(B, "M36 52.6l1.4 1.2 1.2-1 1.4 1.2", w=0.9, o=0.6)
    # the face and a short black beard
    P(B, "M32 18.6H40C40.4 19.8 40.6 20.8 40.8 21.4L42.6 23.6L40.8 24.2C41 25 40.8 25.6 40 25.8C40.2 27 39.6 28 38 28.4C36.4 28.8 34.4 28.4 33 27.2Z", f="skin")
    P(B, "M33 24.6C33.4 27.6 35 29.6 37.4 29.8C38.8 29.8 39.8 29 40.2 27.8C39 28 37.8 27.6 36.8 26.6L35.2 24.4Z", w=1.1, f="dark")
    face(B, (38.4, 21.6))
    # the headcloth falling to the shoulder, with its cord
    P(B, "M30 21C29.2 14.2 32.4 9.8 36.8 9.8C40.8 9.8 43 13.4 42.6 18.8L40.8 18.8C39.8 16.4 37 15.8 34 16.8L33.2 27.8C32.2 29.8 30.6 30.6 28.6 30.8C28.6 27.2 29.2 24 30 21Z", f="paint")
    P(B, "M30.8 17.6C34.4 16.2 38.8 16 42.4 16.6", w=1.8, s="sign")
    P(B, "M31.4 22l-1 6.6M33.2 21.4l-.6 6", w=0.9, s="red", o=0.8)
    # the near arm, sleeve and hand on the staff
    P(B, limb([(38.4, 33.4, 4.8), (39.2, 37.6, 4.4), (43.4, 36.4, 3.9), (46.2, 35, 3.5)]), f="orange", fo=0.7)
    P(B, "M45 33.6l.6 3", w=1)
    fist(B, 48.3, 34.8)
    P(B, "M18 61.4c9-1 22-1 31 0", w=1.2, o=0.55)
    return B, A, Bb

# ------------------------------------------------------------------ a Byzantine monk (the Judean desert monasteries)
def monk():
    B, A, Bb = [], [], []
    # the dark habit swings at the hem; sandals under it
    P(A, "M23.4 57.6l-.6 2.6c1.6.8 3.6 1 5.4.6-.4-1-1.2-1.8-2.2-2.4Z", w=1.3, f="sign")
    P(A, "M41.4 57.8c0 1.6.2 2.4.6 2.8h5c.2-1-.8-1.8-2.4-2.2Z", w=1.3, f="sign")
    P(A, "M26.4 44H41.6C42.6 49.4 43.6 54.2 44.4 58C38 59.2 30.4 59.2 22.8 57.8C24.2 53.8 25.6 49 26.4 44Z", f="dark", fo=0.88)
    P(A, "M31 46l-1.6 11.6M35.4 46v12.2M39.4 46l1.6 11.8", w=1, s="stone", o=0.5)
    P(Bb, "M30.4 58.4c0 1.2.2 1.8.6 2h4.6c.2-.8-.8-1.4-2.2-1.8Z", w=1.3, f="sign")
    P(Bb, "M37.6 58.4c0 1.2.2 2 .6 2.2h5c.2-.8-.8-1.6-2.4-2Z", w=1.3, f="sign")
    P(Bb, "M26.4 44H41.6C42 49.4 42.2 54.4 42.4 58.6C37 59.6 31 59.6 25.4 58.6C25.8 54.4 26 49.4 26.4 44Z", f="dark", fo=0.88)
    P(Bb, "M30.6 46l-.4 12M34.4 46v12.4M38.4 46l.4 12.2", w=1, s="stone", o=0.5)
    # the habit above the belt, the rope belt with its knotted end
    P(B, "M28 29.6C30.6 28 37.4 28 40 29.8L41.6 44.4H26.4Z", f="dark", fo=0.88)
    P(B, "M26.2 43.2C31.4 44.4 36.4 44.4 41.6 43.2", w=1.6, s="paint")
    P(B, "M29.4 44v8.6", w=1.3, s="paint")
    P(B, "M29.4 47.2h.1M29.4 50.2h.1", w=2.6, s="paint")
    # the face and the long grey beard of a desert father
    P(B, "M31.6 18.6H39.4C39.8 19.8 40 20.8 40.2 21.4L42 23.6L40.2 24.2C40.4 25 40.2 25.6 39.4 25.8L39.2 27H32Z", f="skin")
    face(B, (37.6, 21.8))
    P(B, "M32.4 23.8C32 28.6 32.6 33 34.4 36.4C35.6 38.4 37 39.4 38.4 39.6C38.6 37.6 39.6 36 40.4 34.6C41.2 31.6 41 28.4 40.4 25.8L39.8 25.6C38.4 25.2 37 25 35.8 25.2Z", f="stone")
    P(B, "M34.4 27c-.6 2.2.6 3.8 0 6M36.4 26.6c-.6 2.4.6 4.2 0 6.6M38.4 27c-.6 2.2.6 3.8 0 5.8", w=0.8, o=0.7)
    P(B, "M40.2 25.6C38.8 25.6 37.4 26.2 36.6 27.4C38 27.4 39.4 27 40.2 26.4Z", w=1, f="stone")
    # the hood around the face
    P(B, "M29.2 21.4C28.4 14.2 31.6 9.4 35.8 9.2C40 9 42.8 12.6 42.6 18.2L41 18.4C40.2 15.8 37.8 14.6 35 15C33.2 15.4 32.2 17.2 32 19.6L32.6 30.8C30.4 29.8 29.2 25.8 29.2 21.4Z", f="dark", fo=0.92)
    # the arm in its wide sleeve, holding a book of the Gospels with a gold cross
    P(B, limb([(37.6, 31.4, 5.4), (38.8, 36.4, 4.9), (42.4, 36.4, 4.6), (45, 35.2, 4.2)]), f="dark", fo=0.88)
    P(B, "M43.6 30.6h7.4v8.6h-7.4z", w=1.5, f="red", fo=0.9)
    P(B, "M47.3 32v5.8M45.4 34h3.8", w=1.2, s="gold")
    P(B, circle(46.2, 36.4, 1.9), w=1.4, f="skin")
    P(B, "M18 61.4c9-1 24-1 33 0", w=1.2, o=0.55)
    return B, A, Bb

FIGS = {"assyrian": assyrian, "roman": roman, "priest": priest, "crusader": crusader, "nabataean": nabataean, "monk": monk}
