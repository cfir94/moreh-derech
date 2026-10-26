# אטלס הזמן — איורים לאירועים המכוננים

לאירועי המפתח בציר יש מקום לאיור. כרגע יש שני איורים: המקדש של הורדוס (ST-058) ושריפת המקדש (ST-082). אלה האיורים המצוירים שהבעלים אהב בגרסה הקודמת. אירוע שאין לו איור מוצג ככרטיס רגיל, בלי מקום ריק.

## איך מוסיפים איור

1. מבקשים מצ'אט ג'יפיטי את התמונה, עם בלוק הסגנון שלמטה ועם התיאור של האירוע.
2. שומרים PNG **עם רקע שקוף**, בגודל 1024×1024 או יותר.
3. ממירים ל-WebP בגודל 480×480 ושומרים כ-`public/images/history-atlas/<מזהה>.webp`, למשל `ST-085.webp`. כך הומרו גם שני האיורים הקיימים.
4. מוסיפים רשומה ל-`ILLUSTRATIONS` ב-`src/data/history-atlas/second-temple-tree.ts`. הרשומה כוללת את `src`, את `alt`, שמתאר מה רואים בתמונה, ואת `caption`. ה-caption חייב לכלול את המילה "המחשה". הבדיקות אוכפות את זה, ובודקות גם שהקובץ קיים.

אירוע שיש לו איור מוצג באטלס כאירוע מפתח. האיור מופיע בכרטיס שבציר ובגדול בחלונית הפרטים.

## בלוק הסגנון (להדביק בתחילת כל בקשה)

> Hand-drawn ink-and-watercolor vignette in the style of a vintage illustrated history atlas. A single compact isometric scene floating on a fully transparent background (no ground plane beyond the scene, no frame, no text, no letters). Warm Jerusalem-stone palette — sand, ochre and honey limestone — with olive and cypress greenery, crisp dark-brown outlines and soft watercolor shading. Figures, if any, are small and seen from a distance, without detailed faces. Historically plausible for the Land of Israel in the Second Temple period. Square 1:1, PNG with transparent background.

לשמור על אחידות: לבקש "same style as the previous vignettes" ולצרף אחד משני הקבצים הקיימים כדוגמה (`public/images/history-atlas/ST-058.webp`).

## האיורים לפי סדר עדיפות

| מזהה | אירוע | מה לצייר (להוסיף אחרי בלוק הסגנון) |
|---|---|---|
| ST-085 | נפילת מצדה | The flat-topped mesa of Masada above the Dead Sea cliffs, Herod's palace terraces on its northern edge, the Roman siege ramp climbing the western side and square Roman camps below. |
| ST-055 | בניית הרודיון | Herodium: a cone-shaped artificial mountain in the Judean desert with a round fortress-palace and towers on its summit, a stairway up the slope and a pool complex at its foot. |
| ST-057 | הקמת קיסריה והנמל המלאכותי | Caesarea Maritima: a large artificial harbor with stone breakwaters and a lighthouse tower, merchant ships, a temple on a podium and city buildings along the shore. |
| ST-007 | הצהרת כורש | A Persian royal decree — a sealed scroll and a clay cylinder on a cushion — in the foreground, and a small caravan of returning exiles setting out on a road from Babylon toward the hills of Judah. |
| ST-012 | חנוכת בית המקדש השני | A modest, unadorned stone temple on the Temple Mount with a simple altar and smoke rising, a small crowd of priests and people; humble and plain — NOT the later golden Herodian temple. |
| ST-028 | פרוץ מרד החשמונאים במודיעין | A hilltop village in the Judean foothills with an overturned pagan altar, and a small band of rebels gathering with spears and slings among the olive trees. |
| ST-033 | טיהור המקדש וחידוש הפולחן | Inside the Temple courts: a seven-branched menorah being relit, a pagan statue being carried away, and the altar being rebuilt with new uncut stones. |
| ST-049 | כיבוש פומפיוס וביטול המלוכה | Roman legionaries with eagle standards and siege engines before the walls of the Temple Mount in Jerusalem. |
| ST-015 | בניית חומת נחמיה | Builders rebuilding Jerusalem's wall in haste, each holding a trowel with a sword at hand, stones and scaffolding along the wall of the City of David. |
| ST-013 | עליית עזרא הסופר | Ezra the scribe reading a Torah scroll from a raised wooden platform to a gathered assembly in an open square near a city gate. |
| ST-017 | כיבוש הארץ בידי אלכסנדר | A Macedonian phalanx with long sarissas marching along the coastal road past a walled Phoenician harbor city. |
| ST-021 | קרב פניון והמעבר לשלטון סלאוקי | A battle near the springs of Banias at the foot of snow-capped Mount Hermon, with Seleucid war elephants and cavalry. |
| ST-080 | מצור טיטוס ופריצת החומות | Roman battering rams and siege towers breaching Jerusalem's walls, legionaries in testudo formation, the Temple visible beyond. |
| ST-004 | חורבן בית ראשון והגליית נבוכדנצר | Jerusalem burning behind its walls as a Babylonian army leads a line of exiles away eastward. |
| ST-083 | כיבוש העיר העליונה | The mansions of Jerusalem's Upper City on the western hill in flames, with collapsed roofs and Roman soldiers in the streets. |
| ST-060 | מות הורדוס וחלוקת הממלכה | A stylized map-like vignette of Herod's kingdom divided into three parts — Judea, Galilee with Perea, and the Bashan and Golan — each marked by a small crown. |
| ST-062 | הדחת ארכלאוס ותחילת נציבות יהודה | A Roman governor's curule chair and fasces in a colonnaded courtyard at Caesarea, with a Roman standard. |
| ST-072 | מאורעות קיסריה ופעולות פלורוס | A tense street in Caesarea beside a synagogue, a crowd and Roman soldiers facing each other. |

מקור העובדות בכל שורה הוא כרטיס האירוע עצמו, שנלקח מ-`research.json`. לפני שמוסיפים איור כדאי לוודא שמה שמצויר תואם את הכרטיס. אם התמונה מראה פרט שהקורס לא מלמד, צריך לציין אותו בכיתוב, או לא להשתמש בתמונה.
