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
4. **מורידים את הקובץ** ושומרים אותו בשם המזהה, למשל `FT-06.png`.
   אם קשה לשנות שם, גם זה בסדר: צ'אט ג'יפיטי כותב את המזהה מתחת לכל תמונה, ואפשר לשלוח לי
   צילום מסך שבו רואים את שניהם.
5. **אם הסגנון מתחיל לזלוג** (צילומי, תלת־ממד, צבעים אחרים), מדביקים את **תזכורת הסגנון**.

**מה שולחים לי:** את קובצי ה־PNG, בבת אחת או בכמה סבבים. גם צילומי מסך של כמה תמונות יחד
עובדים: אני חותך אותם, מסיר רקע אם נשאר, מקטין, מוסיף כיתוב בעברית ומציב כל איור על
הציר בשנה של האירוע שלו.

---

## מה חסר — 25 איורים

האטלס מתחיל עכשיו בראשית האדם, ולפרהיסטוריה ולתקופת הברונזה אין עדיין אף איור. בנוסף חסרים
עדיין חמשת האיורים של בית ראשון מהסבב הקודם.

**בציר הראשי** (נקודות המפנה הגדולות — 9 איורים):

| מזהה | אירוע | תקופה |
|---|---|---|
| PH-05 | השליטה באש — גשר בנות יעקב | לפני כ־790,000 שנה |
| PH-19 | הכפר הנטופי — היושבים הראשונים | לפני כ־15,000–11,500 שנה |
| PH-23 | המגדל ביריחו — ראשית הניאולית | סביב 8300 לפנה״ס |
| BR-12 | ירושלים הכנענית מתבצרת — מגדל המעיין | המאה ה־18 לפנה״ס |
| FT-06 | דוד כובש את ירושלים ומייסד את עיר דוד | סביב 1000 לפנה״ס |
| FT-07 | שלמה בונה את המקדש | סביב 960 לפנה״ס |
| FT-08 | פילוג הממלכה | 928 לפנה״ס |
| ST-002 | חורבן שומרון וגלות עשרת השבטים | 720 לפנה״ס |
| FT-20 | מסע סנחריב ומצור לכיש | 701 לפנה״ס |

**במימד "האדם הקדום"** (8 איורים): PH-03 היציאה מאפריקה, PH-11 הקבורות הראשונות בקפזה,
PH-16 אוהלו II על חוף הכנרת, PH-22 המהפכה החקלאית, PH-24 הגולגלות המכוירות, PH-26 שער הגולן,
PH-29 המקדש בעין גדי, PH-31 עפיפוני המדבר.

**במימד "כנען בתקופת הברונזה"** (8 איורים): BR-04 ערד, BR-07 דולמנים בגולן, BR-11 שער הקשת
בתל דן, BR-13 האלפבית במכרות סיני, EC-megiddo קרב מגידו, BR-16 כיבוש יפו בסלים, BR-20 מקדש
חתחור בתמנע, BR-23 גויי הים.

האיורים הקיימים (38) לא משתנים: 15 בציר הראשי, והשאר בתוך המימדים.

## שלב 1 — ההודעה הפותחת (להדביק פעם אחת, בתחילת השיחה)

```
You are my illustrator for an illustrated history atlas of the Land of Israel. Your ONLY job is to generate images.

STRICT RULES — please follow every one:
1. Generate exactly ONE image per message I send. Never combine several scenes into one sheet, grid or collage.
2. Do NOT write code, HTML or CSS. Do NOT build, design or describe a website. Do NOT try to embed, upload or place the images anywhere. I will handle all of that myself.
3. Do NOT ask follow-up questions and do NOT offer alternatives. Just generate the image.
4. After each image, write ONE line only: the ID I gave you followed by a check mark, e.g. "FT-06 ✓". Nothing else.
5. The image must contain NO text, NO letters, NO numbers, NO labels and NO captions — not even on objects such as scrolls, coins, inscriptions or maps (show them as blank or with abstract marks).
6. Prehistoric scenes must look prehistoric: no buildings, metal, pottery or domestic animals unless the description names them.

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

## תזכורת הסגנון (להדביק כשהסגנון זולג)

```
Style reminder for the next images: same hand-drawn ink-and-watercolor isometric vignette as the attached example, fully transparent PNG background, no text or letters anywhere, small distant figures without faces, warm sand-ochre-olive palette, square 1:1. One image per message, then only the line "ID ✓". No code, no website.
```

---

## שלב 2 — הפרומפטים

כל בלוק הוא הודעה אחת. בכותרת: המזהה, שם האירוע והתקופה (לידיעתכם בלבד, לא להעתיק).
אפשר לעבוד לפי הסדר: קודם הציר הראשי, אחר כך המימדים.

### ציר ראשי

#### PH-05 · השליטה באש — גשר בנות יעקב (לפני כ־790,000 שנה)
```
PH-05 — a small band of early humans (Homo erectus, sturdy, dressed in simple animal hides) gathered around a campfire on the muddy bank of a reed-lined river, basalt hand axes and elephant bones lying nearby, a large lake glinting beyond. Primitive, no buildings.
```

#### PH-19 · הכפר הנטופי (לפני כ־15,000–11,500 שנה)
```
PH-19 — a cluster of round semi-sunken stone huts with brush roofs on a wooded hillside terrace, people grinding grain in stone mortars cut into the rock, wild wheat growing around, a dog lying beside a hut. Before farming: no fields, no domestic animals except the dog.
```

#### PH-23 · המגדל ביריחו (סביב 8300 לפנה״ס)
```
PH-23 — a massive round stone tower about nine meters high with an inner staircase opening at its base, standing beside a thick stone wall at the edge of an early village of round mud-brick houses, palm trees and a spring, the dry Jordan valley beyond.
```

#### BR-12 · ירושלים הכנענית מתבצרת (המאה ה־18 לפנה״ס)
```
BR-12 — a Canaanite hill town on a narrow ridge with a wall of huge rough boulders on its eastern slope, and a separate massive square stone tower built over a spring at the bottom of the valley, a protected passage leading from the town down to the tower.
```

#### FT-06 · דוד כובש את יבוס ומייסד את עיר דוד (סביב 1000 לפנה״ס)
```
FT-06 — a small walled hill town on a narrow ridge above a spring in a deep valley (the City of David), stepped stone terraces on its slope, and a band of warriors climbing up from the spring.
```

#### FT-07 · שלמה בונה את המקדש (סביב 960 לפנה״ס)
```
FT-07 — a modest rectangular Iron Age temple with two free-standing bronze pillars at its entrance, on a hilltop above a small walled city, workers carrying cedar beams. Plain and archaic — NOT the later golden Herodian temple.
```

#### FT-08 · פילוג הממלכה (928 לפנה״ס)
```
FT-08 — two hilltop capitals facing each other across a valley, a road splitting in two between them, each side with its own banner of a different color; small crowds gathering at each gate.
```

#### ST-002 · חורבן שומרון וגלות עשרת השבטים (720 לפנה״ס)
```
ST-002 — a royal hilltop city with fine stone walls burning, Assyrian siege engines at the walls, and a long column of captives led away into the distance.
```

#### FT-20 · מסע סנחריב ומצור לכיש (701 לפנה״ס)
```
FT-20 — an Assyrian army besieging a fortified city on a mound, a great earthen siege ramp up to the walls, battering rams and archers, defenders on the towers.
```

### המימד "האדם הקדום"

#### PH-03 · היציאה הראשונה מאפריקה (לפני כ־1.8 מיליון שנה)
```
PH-03 — a small group of early humans walking in single file across an open savanna landscape with acacia trees, carrying stone hand axes and sticks, heading toward distant hills; giraffes and elephants far off.
```

#### PH-11 · הקבורות הראשונות — קפזה וסחול
```
PH-11 — the mouth of a large limestone cave on a hillside; inside, a few people gently lay a body in a shallow pit, placing a deer antler on it as an offering. Quiet, respectful, seen from a distance, no visible body details.
```

#### PH-16 · אוהלו II — הסוכות על חוף הכנרת (לפני כ־23,000 שנה)
```
PH-16 — oval brush huts made of branches on the shore of a large lake, fishermen with simple nets at the water, people gathering wild grain, a small fire between the huts.
```

#### PH-22 · המהפכה החקלאית
```
PH-22 — a hillside village of rectangular mud-brick houses surrounded by small fields of wheat and barley, people harvesting with flint sickles, goats and sheep in a stone pen.
```

#### PH-24 · הגולגלות המכוירות — פולחן האבות
```
PH-24 — the interior of a rectangular house with a plastered floor, a family seated around a low niche where several plastered skulls with shell eyes are arranged on a shelf. Calm and domestic, no gore.
```

#### PH-26 · שער הגולן — ראשית כלי החרס
```
PH-26 — a riverside village with large courtyard houses and a stone-paved street, a potter shaping clay vessels, rows of small clay figurines drying in the sun, the river with reeds beside the village.
```

#### PH-29 · המקדש בעין גדי ואוצר נחל משמר
```
PH-29 — a lonely walled stone temple compound on a cliff terrace above a green spring oasis and the Dead Sea, and far away a cave in a desert canyon where people hide a bundle of copper scepters and crowns.
```

#### PH-31 · עפיפוני המדבר
```
PH-31 — an aerial view of a desert plain where two long low stone walls converge like a funnel into a star-shaped stone enclosure, hunters driving a herd of gazelles toward it.
```

### המימד "כנען בתקופת הברונזה"

#### BR-04 · ערד — עיר מתוכננת (הברונזה הקדומה)
```
BR-04 — an Early Bronze Age city in a desert basin, enclosed by a long stone wall with semicircular towers, broad-room houses with courtyards, a twin temple compound with a standing stone, and a water reservoir at the lowest point.
```

#### BR-07 · ההפסקה העירונית — דולמנים בגולן
```
BR-07 — a rocky basalt plateau with scattered dolmens (two standing slabs topped by a huge flat stone) and burial cairns, a shepherd with a flock of sheep and goats passing between them, round huts in the distance. No city.
```

#### BR-11 · שער הקשת בתל דן (סביב 1800 לפנה״ס)
```
BR-11 — a mud-brick city gate with a true round arch over the passage and towers on both sides, set into a huge sloping earthen rampart, a road leading in from a green valley with springs.
```

#### BR-13 · האלפבית הפרוטו־סינאי — מכרות הטורקיז בסיני
```
BR-13 — a desert mountainside with turquoise mine entrances and a small Egyptian shrine; a Canaanite worker scratches simple pictorial signs (an ox head, waves of water, a house) on a rock face. Signs only as abstract pictograms, no real letters.
```

#### EC-megiddo · תחותמס השלישי וקרב מגידו (1457 לפנה״ס)
```
EC-megiddo — an Egyptian army with chariots emerging from a narrow wooded mountain pass onto a plain below a fortified city on a mound, Canaanite chariots drawn up in front of the city.
```

#### BR-16 · כיבוש יפו בתחבולת הסלים
```
BR-16 — a walled harbor town by the sea; a line of porters carries large woven baskets through the open city gate, and one basket is slightly open showing a soldier hidden inside.
```

#### BR-20 · מקדש חתחור במכרות תמנע
```
BR-20 — a small open-air Egyptian shrine at the foot of huge red sandstone pillars in a desert valley, copper smelting furnaces smoking nearby, miners carrying ore.
```

#### BR-23 · קריסת סוף הברונזה וגויי הים
```
BR-23 — a sea battle near a coast: Egyptian ships with lion-headed prows against ships with bird-headed prows carrying warriors in feathered headdresses, and on the shore families with ox-carts migrating. Seen from afar.
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
