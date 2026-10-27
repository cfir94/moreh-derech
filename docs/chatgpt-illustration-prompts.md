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

**מה שולחים לי:** את חמשת קובצי ה־PNG, בבת אחת או בכמה סבבים. גם צילומי מסך של כמה תמונות יחד
עובדים: אני חותך אותם, מסיר רקע אם נשאר, מקטין, מוסיף כיתוב בעברית ומציב כל איור על
הציר בשנה של האירוע שלו.

---

## כמה איורים צריך — ולמה רק חמישה

בציר הראשי יש **לכל היותר 20 איורים**, רק לנקודות המפנה הגדולות. 15 מהם כבר קיימים, וחסרים חמישה, כולם מתקופת בית ראשון:

| מזהה | אירוע |
|---|---|
| FT-06 | דוד כובש את ירושלים ומייסד את עיר דוד |
| FT-07 | שלמה בונה את המקדש |
| FT-08 | פילוג הממלכה |
| ST-002 | חורבן שומרון וגלות עשרת השבטים |
| FT-20 | מסע סנחריב ומצור לכיש |

האיורים שכבר קיימים בציר הראשי: חורבן בית ראשון (ST-004), הצהרת כורש (ST-007), אלכסנדר (ST-017), טיהור המקדש (ST-033), פומפיוס (ST-049), מקדש הורדוס (ST-058), הצליבה (ST-065), שריפת המקדש (ST-082), מצדה (ST-085), מרד בר כוכבא (RO-031), חתימת המשנה (RO-036), כנסיית הקבר (BY-007), יוסטיניאנוס (BY-033), הכיבוש הפרסי (BY-039) והכיבוש המוסלמי (BY-044).

שאר 23 האיורים שצ'אט ג'יפיטי כבר צייר לא נמחקו. הם מופיעים בתוך הנושאים (למשל מודיעין במרד החשמונאים, הרודיון וקיסריה בבית הורדוס), ולא בציר הראשי.

## שלב 1 — ההודעה הפותחת (להדביק פעם אחת, בתחילת השיחה)

```
You are my illustrator for an illustrated history atlas of the Land of Israel. Your ONLY job is to generate images.

STRICT RULES — please follow every one:
1. Generate exactly ONE image per message I send. Never combine several scenes into one sheet, grid or collage.
2. Do NOT write code, HTML or CSS. Do NOT build, design or describe a website. Do NOT try to embed, upload or place the images anywhere. I will handle all of that myself.
3. Do NOT ask follow-up questions and do NOT offer alternatives. Just generate the image.
4. After each image, write ONE line only: the ID I gave you followed by a check mark, e.g. "FT-06 ✓". Nothing else.
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

## תזכורת הסגנון (להדביק כשהסגנון זולג)

```
Style reminder for the next images: same hand-drawn ink-and-watercolor isometric vignette as the attached example, fully transparent PNG background, no text or letters anywhere, small distant figures without faces, warm sand-ochre-olive palette, square 1:1. One image per message, then only the line "ID ✓". No code, no website.
```

---

## שלב 2 — חמשת הפרומפטים

כל בלוק הוא הודעה אחת. בכותרת: המזהה, שם האירוע והשנה (לידיעתכם בלבד, לא להעתיק).

### FT-06 · דוד כובש את יבוס ומייסד את עיר דוד (סביב 1000 לפנה״ס)
```
FT-06 — a small walled hill town on a narrow ridge above a spring in a deep valley (the City of David), stepped stone terraces on its slope, and a band of warriors climbing up from the spring.
```

### FT-07 · שלמה בונה את המקדש (סביב 960 לפנה״ס)
```
FT-07 — a modest rectangular Iron Age temple with two free-standing bronze pillars at its entrance, on a hilltop above a small walled city, workers carrying cedar beams. Plain and archaic — NOT the later golden Herodian temple.
```

### FT-08 · פילוג הממלכה (928 לפנה״ס)
```
FT-08 — two hilltop capitals facing each other across a valley, a road splitting in two between them, each side with its own banner of a different color; small crowds gathering at each gate.
```

### ST-002 · חורבן שומרון וגלות עשרת השבטים (720 לפנה״ס)
```
ST-002 — a royal hilltop city with fine stone walls burning, Assyrian siege engines at the walls, and a long column of captives led away into the distance.
```

### FT-20 · מסע סנחריב ומצור לכיש (701 לפנה״ס)
```
FT-20 — an Assyrian army besieging a fortified city on a mound, a great earthen siege ramp up to the walls, battering rams and archers, defenders on the towers.
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
