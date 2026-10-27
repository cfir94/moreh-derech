# איורים לאטלס הזמן — הוראות לצ'אט ג'יפיטי

המסמך הזה מיועד לעבודה עם צ'אט ג'יפיטי, והוא בנוי כך שאפשר להעתיק ממנו ישירות.
התפקיד של צ'אט ג'יפיטי כאן הוא **לצייר בלבד**. הוא לא בונה אתר, לא כותב קוד ולא
"מטמיע" את התמונות. החיבור לאתר נעשה אחר כך, אצלי.

בפעם הקודמת הוא נתקע כשניסה להטמיע את התמונות בעצמו, ולכן ההודעה הפותחת (שלב 1)
אוסרת זאת במפורש. אם הוא מתחיל בכל זאת לכתוב קוד, ראו "כשמשהו משתבש" בסוף המסמך.

---

## איך עובדים — חמישה שלבים

1. **פותחים שיחה חדשה** בצ'אט ג'יפיטי. מצרפים איור קיים אחד כדוגמת סגנון. הכי טוב
   `public/images/history-atlas/ST-058.webp` (המקדש של הורדוס), ואפשר גם `ST-085.webp` (מצדה).
   מדביקים את **ההודעה הפותחת** שבהמשך, כמו שהיא.
2. **שולחים פרומפט אחד בכל הודעה.** כל פרומפט הוא בלוק קוד אחד מהרשימה. לא שולחים כמה יחד:
   כששולחים כמה, הוא מחבר אותם לגיליון אחד במקום לייצר תמונות נפרדות.
3. **בודקים את התמונה**: האם הרקע שקוף, האם אין בה כיתוב או אותיות, והאם היא דומה בסגנון לדוגמה.
   אם משהו לא בסדר, עונים בשורה אחת מתוך "כשמשהו משתבש".
4. **מורידים את הקובץ** ושומרים אותו בשם המזהה, למשל `ST-001.png`.
   אם קשה לשנות שם, גם זה בסדר: צ'אט ג'יפיטי כותב את המזהה מתחת לכל תמונה, ואפשר לשלוח לי
   צילום מסך שבו רואים את שניהם.
5. **אחרי כ־10 תמונות** מדביקים את **תזכורת הסגנון**, כדי שהסגנון לא יתחיל לזלוג.

**מה שולחים לי:** את קובצי ה־PNG, בבת אחת או בכמה סבבים. גם צילומי מסך של כמה תמונות יחד
עובדים: אני חותך אותם, מסיר רקע אם נשאר, מקטין, מוסיף כיתוב בעברית ומציב כל איור על
הציר בשנה של האירוע שלו.

**סדר עדיפויות:** אירוע שמסומן ב־★ הוא אירוע מפתח שהמבחן שואל עליו. כדאי להתחיל
מהם, בכל התקופות, ורק אחר כך לעבור לשאר.

---

## האיורים שכבר קיימים — לא לצייר שוב

38 איורים כבר מחוברים לאטלס:

| תקופה | מזהים |
|---|---|
| בית ראשון וחורבנו | ST-004 |
| שיבת ציון והפרסים | ST-007, ST-012, ST-015 |
| התקופה ההלניסטית והחשמונאית | ST-017, ST-028, ST-033, ST-049 |
| הורדוס והנציבים | ST-055, ST-057, ST-058, ST-065 |
| המרד הגדול | ST-080, ST-082, ST-085 |
| התקופה הרומית | RO-020, RO-021, RO-026, RO-030, RO-031, RO-033, RO-036, RO-037, RO-044, RO-046, RO-047 |
| התקופה הביזנטית | BY-002, BY-003, BY-007, BY-011, BY-026, BY-031, BY-033, BY-036, BY-039, BY-041, BY-043, BY-044 |

לתקופת הברונזה ולבית ראשון (מזהי `EC-` ו־`FT-`) אין עדיין אף איור, ולכן שם החוסר הגדול ביותר.

---

## שלב 1 — ההודעה הפותחת (להדביק פעם אחת, בתחילת השיחה)

```
You are my illustrator for an illustrated history atlas of the Land of Israel. Your ONLY job is to generate images.

STRICT RULES — please follow every one:
1. Generate exactly ONE image per message I send. Never combine several scenes into one sheet, grid or collage.
2. Do NOT write code, HTML or CSS. Do NOT build, design or describe a website. Do NOT try to embed, upload or place the images anywhere. I will handle all of that myself.
3. Do NOT ask follow-up questions and do NOT offer alternatives. Just generate the image.
4. After each image, write ONE line only: the ID I gave you followed by a check mark, e.g. "ST-001 ✓". Nothing else.
5. The image must contain NO text, NO letters, NO numbers, NO labels and NO captions — not even on objects such as scrolls, coins, inscriptions or maps (show them as blank or with abstract marks).

STYLE — identical for every image, matching the attached example:
- Hand-drawn ink-and-watercolor vignette in the style of a vintage illustrated history atlas.
- One compact scene seen from above at an isometric angle, like a small island floating on its own.
- FULLY TRANSPARENT background: PNG with alpha. No sky box, no paper texture, no frame, no border, no shadow plate, no ground beyond the edges of the scene.
- Warm palette: sand, ochre and honey-coloured limestone, olive and cypress greenery, crisp dark-brown outlines, soft watercolor shading.
- People are small and seen from a distance, with no detailed faces.
- Restrained and respectful: battles and destruction are shown from afar, with no blood, no gore and no close-up of bodies.
- Square 1:1, about 1024×1024 pixels, with the scene filling most of the square.

Each message I send will look like: "ID — scene description". Reply with the image and the line "ID ✓". Ready? Reply only "Ready".
```

## תזכורת הסגנון (להדביק כל ~10 תמונות, או כשהסגנון זולג)

```
Style reminder for the next images: same hand-drawn ink-and-watercolor isometric vignette as the attached example, fully transparent PNG background, no text or letters anywhere, small distant figures without faces, warm sand-ochre-olive palette, square 1:1. One image per message, then only the line "ID ✓". No code, no website.
```

---

## שלב 2 — הפרומפטים

כל בלוק הוא הודעה אחת. בכותרת: המזהה, שם האירוע והשנה (לידיעתכם בלבד, לא להעתיק).

### תקופת הברונזה והמסורת על ראשית ישראל

#### EC-megiddo · תחותמס השלישי וקרב מגידו (1457 לפנה״ס) ★
```
EC-megiddo — Egyptian war chariots emerging from a narrow wooded mountain pass onto a plain, before a fortified Canaanite mound-city with a mudbrick gate and towers; the city's defenders on the walls.
```

#### EC-amarna · אחנתון ומכתבי אל־עמארנה (סביב 1350 לפנה״ס) ★
```
EC-amarna — an Egyptian palace courtyard open to the sun, the sun disc sending long rays ending in small hands; in front, a scribe's table with a heap of small pillow-shaped clay tablets covered in tiny unreadable wedge marks, and a messenger with a donkey arriving from the Canaanite hills.
```

#### EC-ramses · רעמסס השני (1279–1213 לפנה״ס)
```
EC-ramses — a pharaoh in a blue crown on a gilded war chariot leading a column of Egyptian chariots along a coastal road, a small Canaanite fortress on a hill in the background.
```

#### EC-amenhotep · אמנחותפ השלישי (1390–1350 לפנה״ס)
```
EC-amenhotep — two colossal seated stone statues of a pharaoh at the entrance of a vast Egyptian temple, palm trees and the Nile behind, tiny figures at their feet for scale.
```

#### EC-exodus · מסורת העבדות ויציאת מצרים ★
```
EC-exodus — a long procession of families with sheep, goats and laden donkeys leaving an Egyptian brick-making town at the edge of the desert, heading toward bare mountains; a pillar of cloud ahead of them. Mood: tradition and legend, not a battle.
```

#### EC-merneptah · מרנפתח ומצבת ישראל (סביב 1208 לפנה״ס) ★
```
EC-merneptah — a tall rounded-top Egyptian granite stele carved with a pharaoh and gods in relief (no readable writing), standing in the sand, and a small Egyptian chariot column passing by in the distance toward green Canaanite hills.
```

#### EC-highlands · ראשית ישראל בהר המרכזי (המאות ה־13–12 לפנה״ס) ★
```
EC-highlands — a small unwalled village on a hilltop in the central hill country: a ring of simple stone four-room houses with stone pillars, stepped agricultural terraces on the slopes, large clay storage jars, a few sheep and a threshing floor.
```

### האבות, הכיבוש והשופטים (מסורת)

#### FT-01 · אברהם בכנען — שכם, בית אל וחברון ★
```
FT-01 — a nomad camp of dark goat-hair tents beneath a great oak tree in the hills, flocks of sheep grazing, and a small altar of rough field stones beside the tents.
```

#### FT-02 · ירידת יעקב ובניו למצרים
```
FT-02 — a family caravan of men, women and children with donkeys and flocks descending from dry hills toward the green Nile delta, an Egyptian town with palm trees in the distance.
```

#### FT-03 · כיבוש יריחו והברית בשכם ★
```
FT-03 — the walls of an ancient oasis city among palm trees crumbling outward, a procession of priests blowing rams' horns circling the city, and the people watching from a distance.
```

#### FT-04 · שבי ארון הברית וחורבן שילה
```
FT-04 — a hilltop sanctuary town (Shiloh) burning, while warriors with feathered headdresses carry away a gold-covered chest on poles down the slope.
```

#### FT-05 · משיחת שאול ומותו בהר הגלבוע ★
```
FT-05 — a battle on the bare slopes of a long mountain ridge above a green valley: archers in feathered headdresses pressing uphill, and a small band of Israelite warriors falling back on the summit.
```

#### FT-06 · דוד כובש את יבוס ומייסד את עיר דוד (סביב 1000 לפנה״ס) ★
```
FT-06 — a small walled hill town on a narrow ridge above a spring in a deep valley (the City of David), stepped stone terraces on its slope, and a band of warriors climbing up from the spring.
```

#### FT-07 · שלמה בונה את המקדש ואת חצור, מגידו וגזר (סביב 960 לפנה״ס) ★
```
FT-07 — a modest rectangular Iron Age temple with two free-standing bronze pillars at its entrance, on a hilltop above a small walled city, workers carrying cedar beams. Plain and archaic — NOT the later golden Herodian temple.
```

### ממלכות ישראל ויהודה

#### FT-08 · פילוג הממלכה (928 לפנה״ס) ★
```
FT-08 — two hilltop capitals facing each other across a valley, a road splitting in two between them, each side with its own banner of a different color; small crowds gathering at each gate.
```

#### FT-09 · ירבעם מקים את מקדשי דן ובית אל ★
```
FT-09 — an open-air stone cult platform among springs and trees at the foot of a mountain, with a large four-horned altar and a small golden calf statue on a pedestal, worshippers approaching.
```

#### FT-10 · מסע שישק לירושלים (925 לפנה״ס)
```
FT-10 — an Egyptian army with chariots and archers marching through the Judean hills toward a walled city, carts loaded with gold shields and treasure leaving the city.
```

#### FT-11 · קרב קרקר (853 לפנה״ס) ★
```
FT-11 — Assyrian chariots and archers clashing with a large coalition army full of chariots on a river plain in Syria.
```

#### FT-13 · מרד יהוא (841 לפנה״ס)
```
FT-13 — a single war chariot driven furiously along a valley road toward a royal city with a high watchtower, a lookout on the tower pointing at the approaching chariot.
```

#### FT-14 · האובליסק השחור (יהוא)
```
FT-14 — a tall black stone obelisk with a stepped top, carved in horizontal bands of relief scenes of tribute bearers and a kneeling figure before a king (no readable writing), standing in an Assyrian palace courtyard.
```

#### FT-15 · מרד מישע מלך מואב
```
FT-15 — the king of Moab's warriors storming a small Israelite fortress on a plateau east of the Dead Sea, the Dead Sea and the hills of Judah in the background.
```

#### FT-16 · מצבת מישע ומצבת תל דן ★
```
FT-16 — two ancient black basalt stelae side by side: one tall with a rounded top, one broken into fragments, both covered with dense rows of tiny abstract carved marks (NOT readable letters), lying in an excavation trench with an archaeologist's brush and baskets.
```

#### FT-17 · אוסטרקוני שומרון
```
FT-17 — the ruins of a royal palace on a hill with fine ashlar walls, and in front a pile of pottery shards with faint unreadable ink marks beside tall wine and oil jars.
```

#### FT-18 · ביצורי חזקיהו לקראת המרד
```
FT-18 — builders hurriedly constructing a very thick city wall through a neighbourhood of houses on a hill, demolishing some houses to make room for it.
```

#### FT-19 · כתובת השילוח ונקבת חזקיהו (701 לפנה״ס) ★
```
FT-19 — a cut-away view of a narrow winding rock tunnel carrying water under a hill, two teams of stonecutters with picks meeting in the middle by lamplight.
```

#### FT-20 · מסע סנחריב, מצור לכיש (701 לפנה״ס) ★
```
FT-20 — an Assyrian army besieging a fortified city on a mound, a great earthen siege ramp up to the walls, battering rams and archers, defenders on the towers.
```

#### FT-21 · תבליטי לכיש בנינווה
```
FT-21 — the interior of an Assyrian palace hall whose long stone walls are carved with reliefs of a city siege and captives, a seated king on a throne at the end of the hall.
```

#### FT-22 · מנסרת סנחריב
```
FT-22 — a tall six-sided clay prism covered in tiny unreadable wedge marks, standing on a wooden table beside clay tablets and a reed stylus in an Assyrian scribe's room.
```

#### FT-23 · קמעות כתף הינום
```
FT-23 — a rock-cut burial cave with stone benches, and in the foreground two tiny rolled silver scrolls on a cloth beside a small lamp and pottery vessels.
```

#### FT-24 · קרב מגידו, מות יאשיהו (609 לפנה״ס) ★
```
FT-24 — an Egyptian army marching north past the mound of Megiddo, a small Judean chariot force meeting it at the pass.
```

#### FT-25 · מכתבי לכיש (587–586 לפנה״ס)
```
FT-25 — a lone fortress on a hilltop at night with a fire beacon burning on its tower, a distant second hill whose beacon has gone dark, and in the foreground a pottery shard with faint unreadable ink marks.
```

### גלויות בית ראשון

#### ST-001 · גלות תגלת פילאסר (732 לפנה״ס) ★
```
ST-001 — Assyrian soldiers with conical helmets leading a long line of deportees with bundles out of the green Galilee hills, a burned village behind them.
```

#### ST-002 · חורבן שומרון והגליית ממלכת ישראל (720 לפנה״ס) ★
```
ST-002 — a royal hilltop city with fine stone walls burning, Assyrian siege engines at the walls, and a column of captives led away into the distance.
```

#### ST-003 · גלות יהויכין (597 לפנה״ס)
```
ST-003 — a young king, nobles and craftsmen carrying their tools being led out of a city gate by Babylonian soldiers, the city itself still standing behind them.
```

#### ST-005 · מינוי גדליהו ורצחו במצפה
```
ST-005 — a small walled hilltop town among vineyards and fig trees after a great war, farmers bringing in a rich harvest of grapes and figs to a governor's modest residence.
```

### שיבת ציון והתקופה הפרסית

#### ST-008 · גל העלייה הראשון של שבי ציון ★
```
ST-008 — a caravan of returning exiles arriving at the ruined hills of Jerusalem, some already clearing rubble and building simple stone houses among the ruins.
```

#### ST-009 · חידוש המזבח והקרבת הקורבנות
```
ST-009 — a square altar of unhewn stones rebuilt on a ruined hilltop, smoke rising, priests in white beside it and a small crowd, the temple not yet built.
```

#### ST-011 · חידוש הבנייה בעידוד הנביאים
```
ST-011 — builders resuming work on the foundations of a temple on a hilltop, two elderly prophets in simple robes encouraging them, piles of cut stones and wooden scaffolding.
```

#### ST-013 · עליית עזרא הסופר ★
```
ST-013 — a scribe standing on a tall wooden platform in a city square near a gate, reading from a large open scroll to a great crowd of men, women and children listening.
```

#### ST-014 · עליית נחמיה ומינויו לפחה
```
ST-014 — a Persian palace hall with tall fluted columns topped by double-bull capitals, a cupbearer offering a cup to the seated Persian king.
```

#### ST-016 · הרפורמות והאמנה בימי עזרא ונחמיה
```
ST-016 — city gates of Jerusalem being closed at dusk on the Sabbath, merchants with laden donkeys waiting outside the wall.
```

### התקופה ההלניסטית

#### ST-018 · מלחמות הדיאדוכים והתייצבות השלטון התלמי ★
```
ST-018 — two Hellenistic armies clashing on a coastal plain: Macedonian phalanxes with long spears and armoured war elephants, a coastal fortress in the distance.
```

#### ST-019 · בנייה הלניסטית באקו־פטולמאיס
```
ST-019 — a Hellenistic harbour city with a fortified seawall, a small temple with columns, a busy port full of merchant ships.
```

#### ST-020 · תרגום השבעים ★
```
ST-020 — scholars in robes seated at many small desks with scrolls in a colonnaded courtyard of Alexandria, the tall Pharos lighthouse on the shore behind them.
```

#### ST-021 · קרב פניון והמעבר לשלטון סלאוקי (200 לפנה״ס) ★
```
ST-021 — a battle with war elephants and cavalry near springs at the foot of a tall mountain with a large cave in its cliff, streams running down to the valley.
```

#### ST-023 · פרשת הליודורוס
```
ST-023 — a Greek official with soldiers at the door of a temple treasury, halted and thrown back by a shining rider on a white horse that appears in the doorway.
```

#### ST-024 · רכישת הכהונה הגדולה בידי יסון — הגימנסיון בירושלים ★
```
ST-024 — a new Greek-style gymnasium with a colonnaded courtyard built in Jerusalem below the temple mount, young men in wide-brimmed Greek hats exercising and running.
```

#### ST-026 · האולטימטום הרומי במצרים ("יום אלאוסיס")
```
ST-026 — on a sandy plain near Alexandria, a Roman envoy in a toga drawing a circle in the sand with a stick around a Hellenistic king in a diadem, the king's army waiting behind.
```

#### ST-027 · דיכוי ירושלים, החקרא וגזרות הדת ★
```
ST-027 — a new Greek fortress with towers overlooking the temple mount, soldiers burning scrolls in the street, and a pagan altar set up in the temple courtyard.
```

### מרד החשמונאים

#### ST-029 · קרב מעלה לבונה
```
ST-029 — a small rebel force charging down from the hills onto a marching enemy column on a mountain road through olive groves.
```

#### ST-030 · קרב בית חורון נגד סירון ★
```
ST-030 — rebels ambushing a long enemy column on a narrow, steep ascent between hills, the enemy fleeing down the slope toward the coastal plain.
```

#### ST-031 · קרב אמאוס ★
```
ST-031 — a large enemy army camp of tents on the edge of the plain at dawn, set on fire, and a band of rebels rushing in from the hills.
```

#### ST-032 · קרב בית צור
```
ST-032 — a hilltop fortress on the road south of Jerusalem, rebels holding the hill against Greek cavalry approaching from the south.
```

#### ST-034 · מסע ליזיאס — קרב בית זכריה והפילים
```
ST-034 — a mighty Greek army with armoured war elephants carrying towers advancing through a narrow valley, a single warrior running beneath the largest elephant with a spear.
```

#### ST-035 · הניצחון על ניקנור (161 לפנה״ס)
```
ST-035 — a celebrating rebel army on a hillside near Jerusalem after a victory, the defeated enemy fleeing toward the plain.
```

#### ST-036 · מות יהודה בקרב אלעשה ★
```
ST-036 — a small rebel band surrounded by a much larger enemy army in a rocky landscape, the rebels holding a last stand on a hill. Solemn mood.
```

#### ST-037 · מנהיגות יונתן והכהונה הגדולה
```
ST-037 — a leader being dressed in high-priestly robes (turban, breastplate with twelve coloured stones, robe with bells) in the temple courtyard, a crowd and envoys watching.
```

#### ST-038 · הקמת מקדש חוניו במצרים
```
ST-038 — a small temple shaped like a tall fortified tower inside a walled settlement in the Nile delta, palm trees around.
```

#### ST-040 · מנהיגות שמעון וחיסול החקרא ★
```
ST-040 — the fortress of the Akra overlooking the temple being taken down stone by stone, people celebrating with palm branches and musical instruments.
```

### מלכות החשמונאים

#### ST-043 · כיבושי יוחנן הורקנוס ★
```
ST-043 — a temple on a mountain summit above a fertile valley being destroyed by an army, the city below and a second mountain facing it.
```

#### ST-044 · יהודה אריסטובולוס נוטל תואר מלך
```
ST-044 — a Hasmonean ruler being crowned with a diadem in a Jerusalem palace courtyard, courtiers and priests around him.
```

#### ST-045 · מלכות אלכסנדר ינאי ושיא ההתפשטות ★
```
ST-045 — a Hasmonean army storming a coastal city with an anchor-shaped harbour, warships at sea, the kingdom's hills behind.
```

#### ST-047 · מלכות שלומציון והעדפת הפרושים ★
```
ST-047 — a queen enthroned in a palace hall, sages with scrolls seated in council before her, a peaceful city and fields beyond the windows.
```

#### ST-048 · מלחמת האחים החשמונאית והזמנת פומפיוס
```
ST-048 — two rival armies camped on opposite hills outside Jerusalem, and Roman envoys on horseback arriving between them.
```

### מן הכיבוש הרומי ועד הורדוס

#### ST-050 · מלכות מתתיהו אנטיגונוס בתמיכת הפרתים
```
ST-050 — Parthian horse archers in trousers and pointed caps riding toward Jerusalem's walls, a Hasmonean king greeting them at the gate.
```

#### ST-051 · מינוי הורדוס ברומא (40 לפנה״ס) ★
```
ST-051 — the Roman Senate house and the temple of Jupiter on the Capitol hill in Rome, a procession of senators in togas escorting a man up the steps.
```

#### ST-052 · ביסוס שלטון הורדוס — כיבוש ירושלים (37 לפנה״ס) ★
```
ST-052 — a combined Roman and local army besieging Jerusalem's northern walls with siege towers and ramps, the temple behind the walls.
```

#### ST-053 · קרב אקטיום וחידוש נאמנות הורדוס (31 לפנה״ס)
```
ST-053 — a great naval battle between fleets of Roman warships with rams and oars near a rocky coastline, some ships on fire.
```

#### ST-056 · ארמונות החורף ביריחו ★
```
ST-056 — a luxurious palace complex built on both banks of a desert stream among palm groves, with large swimming pools, gardens, colonnades and a bathhouse.
```

#### ST-059 · מצודת אנטוניה וארמון הורדוס בירושלים
```
ST-059 — a royal palace in Jerusalem with three massive square towers of huge ashlar stones by the western wall, gardens inside the palace courtyard.
```

#### ST-060 · מות הורדוס וחלוקת הממלכה (4 לפנה״ס) ★
```
ST-060 — a royal funeral procession with soldiers, a golden bier and mourners winding toward a cone-shaped mountain fortress in the desert.
```

#### ST-061 · פולמוס וארוס
```
ST-061 — Roman legions marching through the Galilee hills toward a burning town on a hill, smoke rising.
```

### ימי הנציבים וישוע

#### ST-062 · הדחת ארכלאוס ותחילת נציבות יהודה (6 לספירה) ★
```
ST-062 — a Roman governor's palace by the sea at Caesarea, a Roman official arriving by ship with lictors and soldiers, the harbour behind.
```

#### ST-063 · מפקד קויריניוס
```
ST-063 — Roman clerks at tables in a town square writing on wax tablets, families with donkeys queuing to be registered.
```

#### ST-087 · הוצאת יוחנן המטביל להורג
```
ST-087 — the Jordan river among reeds with people being baptized by a man in a camel-hair garment, and across the Dead Sea a fortress on a high hill (Machaerus).
```

#### ST-064 · המשך בנייה באזור הכותל המערבי
```
ST-064 — the huge ashlar retaining wall of the temple mount with a monumental stone arch carrying a staircase up to the mount, stonemasons at work with cranes.
```

#### ST-066 · ריצוף הרחוב מבריכת השילוח להר הבית ★
```
ST-066 — a wide paved stepped street rising from a stepped pool at the bottom of a valley up to the temple mount, crowds of pilgrims walking up it.
```

#### ST-069 · מלכות אגריפס הראשון ביהודה
```
ST-069 — a king in royal robes reading from a scroll at the temple courtyard before a crowd, during a festival.
```

#### ST-070 · התחלת החומה השלישית והשלמתה במרד
```
ST-070 — workers building a new, very thick outer city wall with towers on Jerusalem's northern side, the older walls and the temple behind.
```

### המרד הגדול

#### ST-072 · מאורעות קיסריה ופעולות פלורוס
```
ST-072 — a tense street scene in a coastal city: crowds on both sides of a synagogue entrance, Roman soldiers arriving.
```

#### ST-073 · הפסקת הקורבן לשלום הקיסר (66 לספירה) ★
```
ST-073 — priests at the temple altar turning away a Roman offering, rebels raising banners on the temple mount and Roman soldiers retreating from the city.
```

#### ST-074 · תפיסת מצדה בידי מורדים
```
ST-074 — a band of rebels climbing a snaking path up a flat-topped desert mountain fortress above the Dead Sea.
```

#### ST-075 · מסע קסטיוס גאלוס וכישלונו ★
```
ST-075 — a Roman legion retreating in disorder down a narrow, steep mountain ascent, rebels attacking from the heights above, abandoned siege equipment on the road.
```

#### ST-089 · היערכות וביצור הגליל בידי יוסף
```
ST-089 — townspeople building walls around a Galilean hill town, a commander directing the work.
```

#### ST-076 · מסעות אספסיאנוס וכיבוש הגליל — גמלא ★
```
ST-076 — a walled town on a steep camel-hump-shaped ridge between deep ravines (Gamla), Roman legionaries attacking its wall.
```

#### ST-077 · נפילת יודפת ושביית יוסף בן מתתיהו ★
```
ST-077 — a fortified hill town in the Galilee under Roman siege, with an earthen ramp and siege towers, and a hidden cave beneath the town.
```

#### ST-078 · מלחמת הפלגים ושריפת מחסני המזון
```
ST-078 — inside besieged Jerusalem, rival rebel groups fighting in the streets, grain storehouses burning with sacks of grain.
```

#### ST-079 · שנת ארבעת הקיסרים ועליית אספסיאנוס
```
ST-079 — Roman legions in a camp raising their general on a shield and hailing him as emperor, legionary standards held high.
```

#### ST-081 · כיבוש האנטוניה והפסקת התמיד
```
ST-081 — Roman soldiers storming a massive fortress with four corner towers adjoining the temple courtyard.
```

#### ST-083 · כיבוש העיר העליונה והשלמת חורבן ירושלים
```
ST-083 — the upper city of Jerusalem with mansions on the hill burning, Roman soldiers on the walls, the temple mount already in ruins.
```

#### ST-084 · התבססות הלגיון העשירי בירושלים
```
ST-084 — a Roman legionary camp of tents and barracks set up in the ruins of Jerusalem beside three tall towers left standing.
```

### התקופה הרומית (אחרי החורבן)

#### RO-022 · נאפוליס נוסדת ליד שכם (72) ★
```
RO-022 — a new Roman city with a theatre and colonnaded streets built in a green valley between two mountains, a temple on one of the summits.
```

#### RO-024 · קיסריה — קולוניה ובירה
```
RO-024 — a Roman capital city by the sea: a theatre facing the sea, a hippodrome along the shore, an aqueduct on arches and a governor's palace on a promontory.
```

#### RO-025 · רבן גמליאל ביבנה וברכת המינים
```
RO-025 — sages seated in rows in a simple house of study, a leader at the head teaching, others writing on tablets.
```

#### RO-027 · מרד התפוצות — פולמוס של קיטוס (115–117)
```
RO-027 — Roman legions marching through a North African desert city with columns and a harbour, smoke rising from the city.
```

#### RO-028 · לגיון שני בפרובינציה — לגיו ★
```
RO-028 — a large rectangular Roman legionary fortress with stone walls, gates and barracks set on a fertile valley floor near the ancient mound of Megiddo.
```

#### RO-029 · ביקור אדריאנוס בארץ (130) ★
```
RO-029 — a Roman emperor with a beard, in armour and cloak, riding with a mounted escort past a newly built triumphal arch outside a city, citizens welcoming him.
```

#### RO-032 · אגרות בר כוכבא וארכיון בבתא ★
```
RO-032 — a cave high in a desert cliff above a dry riverbed, inside it baskets, leather bags, keys, papyrus rolls and a woman's mirror hidden away; a Roman camp on the cliff opposite.
```

#### RO-034 · גזרות השמד וסוריה פלשתינה (136)
```
RO-034 — Roman soldiers putting up a marker stone at a provincial border on a road, villagers watching quietly and sages secretly teaching in a cave.
```

#### RO-035 · אנטונינוס פיוס מקל; כינוס אושא ★
```
RO-035 — sages gathering in a Galilean village among olive groves and vineyards, seated in a courtyard of a stone house in council.
```

#### RO-038 · קרקלה מעניק אזרחות לכולם (212)
```
RO-038 — a Roman city forum crowded with people of many origins, a herald announcing a decree from a podium beneath a statue of an emperor.
```

#### RO-039 · אמאוס נעשית ניקופוליס
```
RO-039 — a Roman town at the edge of the hills and coastal plain with a bathhouse and a colonnaded street, travellers on the road.
```

#### RO-040 · אוריגנס מגיע לקיסריה ★
```
RO-040 — a great library and school in a Roman seaside city, shelves full of scrolls and codices, a teacher with students copying texts.
```

#### RO-041 · משבר המאה השלישית
```
RO-041 — an abandoned Roman villa with collapsed roof, barbarian riders on the horizon and debased coins scattered on the ground.
```

#### RO-042 · טבריה — מרכז היהדות בארץ ★
```
RO-042 — a city on the shore of the Sea of Galilee with hot springs steaming, a large house of study and many fishing boats on the lake.
```

#### RO-043 · זנוביה מתדמור שולטת במזרח ★
```
RO-043 — a queen on horseback in armour leading cavalry out of a desert city of long colonnades and temples among palm trees (Palmyra).
```

#### RO-045 · הרדיפה הגדולה של הנוצרים
```
RO-045 — Roman soldiers confiscating books and closing the doors of a small house-church, a few believers hiding scrolls in a cellar.
```

#### RO-048 · קונסטנטינוס מאחד את האימפריה (324) ★
```
RO-048 — a victorious Roman emperor's army on the shore of a strait, ships crossing, banners bearing an abstract chi-rho symbol, a city with walls on the far shore.
```

### התקופה הביזנטית

#### BY-004 · חנוכת קונסטנטינופוליס (330) ★
```
BY-004 — a new imperial capital on a peninsula between two seas: a hippodrome, a great palace, a tall column with a statue, walls and ships in the harbour.
```

#### BY-005 · הלאורה הראשונה במדבר יהודה ★
```
BY-005 — a line of small monks' cells and caves along a narrow path on the cliff of a desert gorge, a small church at the centre, a spring below.
```

#### BY-006 · הצליין מבורדו (333) ★
```
BY-006 — a lone traveller with a staff, cloak and leather bag walking along a Roman road with milestones toward the walls of Jerusalem, a church with a dome inside the city.
```

#### BY-008 · קונסטנטינוס מוטבל ומת (337)
```
BY-008 — an elderly emperor in white robes being baptized in a palace chapel, bishops around him, a purple cloak set aside.
```

#### BY-009 · בית הכנסת בחמת טבריה ★
```
BY-009 — a synagogue hall on the shore of the Sea of Galilee next to steaming hot springs, its floor a large colorful mosaic with a zodiac wheel around a sun chariot and a Torah shrine flanked by menorahs (no letters).
```

#### BY-010 · מרד גאלוס (351–352)
```
BY-010 — Roman soldiers marching on a Galilean town on a hill (Sepphoris), the townspeople defending its walls.
```

#### BY-012 · רעידת האדמה של 363 ★
```
BY-012 — a Roman city with colonnaded streets collapsing in an earthquake, columns falling in a row like dominoes, dust rising.
```

#### BY-013 · הנצרות — דת המדינה (380)
```
BY-013 — a pagan temple being closed and its statues removed, while a large new basilica church is built beside it.
```

#### BY-014 · יומן המסע של אגריה ★
```
BY-014 — a woman pilgrim with a small group of monks climbing a red granite desert mountain on a winding path toward a small church on the summit.
```

#### BY-015 · הירונימוס מתיישב בבית לחם ★
```
BY-015 — an elderly scholar with a long beard writing at a desk by candlelight in a cave beneath a church, scrolls and codices around him and a lion lying at his feet.
```

#### BY-016 · שלוש פלאיסטינות (390)
```
BY-016 — a large mosaic-like map of the land divided into three coloured regions with tiny cities, rivers and the Dead Sea, unrolled on a table before officials (no letters).
```

#### BY-017 · פיצול האימפריה (395) ★
```
BY-017 — two crowned emperors standing back to back on a map of the Mediterranean world, one facing west toward Rome and one facing east toward Constantinople.
```

#### BY-018 · חתימת התלמוד הירושלמי ★
```
BY-018 — sages in a house of study in Tiberias by the lake, writing on scrolls and discussing, piles of manuscripts on low tables.
```

#### BY-019 · בתי הכנסת הגליליים — בתארוך חדש ★
```
BY-019 — a grand white limestone synagogue with a columned facade, standing among black basalt houses in a fishing village on the shore of the Sea of Galilee.
```

#### BY-020 · אבתימיוס ונזירות המדבר
```
BY-020 — an elderly monk teaching younger monks at a small monastery in a desert plain, a cistern and a garden of palm trees.
```

#### BY-021 · ביטול הנשיאות (429)
```
BY-021 — an empty seat of honour in a synagogue courtyard, an imperial messenger reading a decree from a scroll, sages listening in silence.
```

#### BY-022 · ועידת אפסוס — מרים "תאוטוקוס" (431)
```
BY-022 — bishops gathering in a great church in a Greek city by the sea, crowds outside carrying torches in celebration.
```

#### BY-023 · הקיסרית אבדוקיה בירושלים ★
```
BY-023 — an empress in a jewelled crown overseeing the building of a new city wall and a large church in Jerusalem, workers on scaffolding.
```

#### BY-024 · ועידת חלקדון; ירושלים פטריארכיה (451) ★
```
BY-024 — a large assembly of bishops in a domed church on the shore opposite Constantinople, an emperor's envoys present, a book open on a stand.
```

#### BY-025 · כנסיית הקטיסמה ★
```
BY-025 — an octagonal church with a rock in its centre on the road between Jerusalem and Bethlehem, pilgrims resting by it.
```

#### BY-027 · מרד השומרונים בימי זנון (484)
```
BY-027 — a church being built on a mountain summit above a city in a valley between two mountains, Byzantine soldiers guarding it.
```

#### BY-028 · שגשוג ערי הנגב ★
```
BY-028 — a desert town of stone houses with three churches, terraced farm fields and dams in the dry riverbeds around it, a camel caravan arriving.
```

#### BY-029 · יוסטיניאנוס עולה לשלטון (527) ★
```
BY-029 — an emperor in a jewelled crown and purple robe with his empress and court in a golden church interior, builders' plans and a model church carried before him.
```

#### BY-030 · מרד השומרונים — יוליאנוס בן סבר (529)
```
BY-030 — rebels in the hills of Samaria facing a column of Byzantine cavalry, a burning church in a valley town.
```

#### BY-032 · מגפת יוסטיניאנוס (541–542) ★
```
BY-032 — a quiet empty port city, ships idle at the docks, closed houses and a few figures carrying burdens through the streets. Restrained, no bodies shown.
```

#### BY-034 · בית הכנסת בבית אלפא ★
```
BY-034 — a synagogue hall in a valley at the foot of a mountain, its floor a mosaic in three panels: a ritual scene with an altar and a ram, a zodiac wheel around a sun chariot, and a Torah shrine flanked by menorahs (naive style, no letters).
```

#### BY-035 · מנזר סנטה קתרינה בסיני ★
```
BY-035 — a fortified monastery with high stone walls and a basilica inside, at the foot of a red granite mountain in the Sinai desert, a garden and a well.
```

#### BY-038 · הצליין מפיאצ'נצה (570)
```
BY-038 — a group of pilgrims with staffs visiting a holy spring by the Jordan, monks and a small church with candles.
```

#### BY-040 · שלטון יהודי קצר בירושלים (614–617)
```
BY-040 — a small group of people rebuilding an altar on the ruined temple mount while Persian soldiers stand at the gate of the city.
```

#### BY-042 · קרב אג'נאדין (634) ★
```
BY-042 — Arab cavalry on horses and camels facing a Byzantine army with standards in hilly country between the coastal plain and the hills.
```

#### BY-045 · נפילת קיסריה (641) ★
```
BY-045 — a fortified Byzantine seaport besieged from the land by an Arab army, the harbour still holding ships, the end of an era.
```

---

## כשמשהו משתבש — שורה אחת להדביק

| מה קרה | מה עונים לו |
|---|---|
| הוא כותב קוד, מציע לבנות אתר, או מסביר איך להטמיע | `Stop. No code and no website. Only generate the image for the ID I sent.` |
| הוא שואל שאלות במקום לצייר | `No questions please — just generate the image as described.` |
| יש רקע (שמיים, נייר, מסגרת) | `Same image, but remove the background completely — transparent PNG with alpha.` |
| יש כיתוב, אותיות או מספרים | `Same image with no text, letters or numbers anywhere.` |
| כמה תמונות בגיליון אחד | `Please generate only one scene, as one single image.` |
| הסגנון השתנה (צילומי, תלת־ממד, מצויר מדי) | להדביק שוב את **תזכורת הסגנון** ולבקש: `Redo the last image in this style.` |
| האנשים גדולים מדי או עם פנים מפורטות | `Make the people much smaller, seen from far away, with no facial detail.` |
| השיחה נעשתה ארוכה ואיטית | לפתוח שיחה חדשה, לצרף שוב את הדוגמה ולהדביק שוב את ההודעה הפותחת |

אם הוא מצייר משהו לא מדויק היסטורית (למשל מקדש הורדוס המוזהב במקום מקדש פשוט מימי שלמה),
עונים: `Not accurate — please follow the scene description exactly.`

---

## רשימת תיוג

- [ ] התמונה שקופה מסביב (או עם רקע אחיד שאפשר להסיר).
- [ ] אין בה אותיות, מספרים או כיתוב.
- [ ] יש בה סצנה אחת בלבד.
- [ ] הקובץ נקרא בשם המזהה (או שהמזהה מופיע בצילום המסך).
- [ ] כל הקבצים נשלחו אליי. את החיבור לאטלס אני עושה.
