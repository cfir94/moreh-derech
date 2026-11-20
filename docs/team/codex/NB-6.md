# NB-6 · Coordinates for the course-tour stops that have none (Codex in the desktop app)

> **For the owner:** paste this whole file into the Codex app on your computer, in the `moreh-derech` folder.

## The goal
NB-4 found places our course tours stood at that the route map doesn't have. 64 of them have no verified coordinates yet, so they can't go on the map. Find a point for each one.

## How to find a point
1. **Ask the tour's notebook first** (NotebookLM): "איפה בדיוק עמדה הקבוצה ב<שם התחנה>? ליד מה, באיזה רחוב, מול מה?" The notebook often names a landmark, a street or a building.
2. **Then a public source**, in this order: OpenStreetMap or Nominatim, Wikipedia, the Nature and Parks Authority website, a municipal website.
3. When the stop is a viewpoint, a courtyard or a balcony, a nearby public landmark is enough (the car park, the entrance, the building): mark it `approx`.
4. **Don't invent a point.** If even an approximate one can't be found, write `null` and give the reason in `note`.

## Output: `docs/team/reports/NB-6-coords.json`
A JSON array, one object per place, in the order of the table below:

```json
[
  {
    "n": 1,
    "region": "golan",
    "notebook": "golan-campus-day-three",
    "name_he": "the name exactly as in the table",
    "lat": 33.2312,
    "lon": 35.7615,
    "precision": "exact | approx | null",
    "source": "OpenStreetMap / Wikipedia / the notebook — with a link",
    "note": "a short line: what the point is (the entrance, the car park, the building itself)"
  }
]
```

- `lat`/`lon` to 4 decimals. Inside Israel: `lat` between 29 and 34, `lon` between 34 and 36.5.
- Before opening the PR, check the file is valid: `python3 -m json.tool docs/team/reports/NB-6-coords.json`.
- **Don't edit `sites.geojson` or any other code file.** Claude puts the places on the map from your file.

## Git
One branch, `codex/NB-6-coords`, and one draft PR titled `NB-6: קואורדינטות לתחנות סיור`. Don't merge.

## Don't stop over small things
A place you can't pin down gets `null` and a reason, and you carry on. Stop only if NotebookLM is unreachable.

## The places (64)

| # | Region | Notebook | Name | Name in English |
|---|---|---|---|---|
| 1 | carmel-coast | `haifa-markets-art` | קיר הגרפיטי של Broken Fingaz ובנק ברקליס (מכללת תילתן) | Broken Fingaz mural and former Barclays Bank |
| 2 | carmel-coast | `haifa-markets-art` | מתחם מחסני הנמל הישנים (מתחם הבולדרינג ובר מעלה לביר) | Old Port Warehouses |
| 3 | carmel-coast | `haifa-markets-art` | ציור הקיר של אלין מור (סמוך לרחוב פלמר) | Aline Moor mural |
| 4 | carmel-coast | `haifa-markets-art` | מועדון החורבה לשעבר (ציור הקיר 'המבול השני') | Former Horba Club |
| 5 | carmel-coast | `haifa-markets-art` | הדרכת המוזיקה של נרי בעיר התחתית | Lower City music guidance |
| 6 | carmel-coast | `haifa-markets-art` | גלריה בידרמן לאמנות ישראלית | Biederman Gallery |
| 7 | carmel-coast | `haifa-markets-art` | השוק הטורקי ורחוב קהילת סלוניקי | Turkish Market |
| 8 | carmel-coast | `haifa-markets-art` | מגדל המים הבריטי וחנות היין של אנדריי סוידן | British water tower and Souidan wine shop |
| 9 | carmel-coast | `haifa-markets-art` | פארק ואדי סאליב ומרכז הפירמידה (בית ספר אחיעזר לשעבר) | Wadi Salib Park and Pyramida |
| 10 | carmel-coast | `haifa-markets-art` | בית המלאכה לארומתרפיה של מאיה אזואלי | Maya Azoulay aromatherapy workshop (transliteration) |
| 11 | carmel-coast | `haifa-markets-art` | הגינה הקהילתית וציור הקיר של בנצי ברופמן | Community garden and Benzi Brofman mural |
| 12 | carmel-coast | `zichron-muhraka-atlit` | זכרון יעקב (בית הקברות ורחוב המייסדים) | Zikhron Yaakov cemetery and historic street |
| 13 | carmel-coast | `haifa` | קמפוס הנמל ומתחם הגרפיטי של Broken Fingaz | Port Campus and Broken Fingaz mural |
| 14 | carmel-coast | `haifa` | השוק הטורקי, רחוב קהילת סלוניקי ובניין בנק אפ"ק | Turkish Market and Anglo-Palestine Bank |
| 15 | carmel-coast | `haifa` | קריית הממשלה (בניין הטיל) ועיר החומה | Sail Tower government complex |
| 16 | carmel-coast | `carmel-archaeology` | חניון בית אורן | Beit Oren parking guidance point |
| 17 | carmel-coast | `carmel-archaeology` | הר שוקף (תחנה 1) | Mount Shokef geology station 1 |
| 18 | carmel-coast | `carmel-archaeology` | קבר מרינוס | Marinus Tomb |
| 19 | carmel-coast | `carmel-archaeology` | הר שוקף - מעבר מחורש אורנים לחורש אלונים (תחנה 2) | Mount Shokef geology station 2 |
| 20 | carmel-coast | `carmel-archaeology` | חורבת רקית (תחנה 3) | Horvat Rakit |
| 21 | carmel-coast | `carmel-archaeology` | מדרון נחל רקית - שורת עצי הקטלב | Nahal Rakit arbutus slope |
| 22 | carmel-coast | `carmel-archaeology` | אפיק נחל רקית (תחנה 4) | Nahal Rakit channel |
| 23 | carmel-coast | `carmel-archaeology` | רכס הכורכר בנחל אורן | Nahal Oren kurkar outcrop |
| 24 | carmel-coast | `carmel-archaeology` | חוף עתלית | Atlit beach geology station |
| 25 | coastal-lowlands | `rishon-ashkelon-ayalon` | באר המושבה ומגדל השמירה (ראשון לציון) | Rishon LeZion Well and watchtower |
| 26 | coastal-lowlands | `rishon-ashkelon-ayalon` | אנדרטת האובליסק המצרי (פארק עד הלום) | Egyptian Obelisk, Ad Halom |
| 27 | coastal-lowlands | `rishon-ashkelon-ayalon` | אתר ניצנים הישנה (הארמון ואנדרטת יד לאישה העברייה הלוחמת) | Old Nitzanim and Woman Warrior Memorial |
| 28 | coastal-lowlands | `rishon-ashkelon-ayalon` | באר אנטיליה (גן לאומי תל אשקלון) | Ashkelon antillia well |
| 29 | coastal-lowlands | `lowlands-lachish-maresha` | כנסיית סנטה אנה (סנדחנה) | Saint Anne (Sandahanna) Church |
| 30 | coastal-lowlands | `lowlands-lachish-maresha` | מערות הפעמון הגדולות בבית גוברין | Beit Guvrin Bell Caves |
| 31 | coastal-lowlands | `lowlands-lachish-maresha` | האמפיתיאטרון הרומי של בית גוברין (אלוותרופוליס) | Beit Guvrin Roman Amphitheatre |
| 32 | desert | `qumran-ein-gedi` | נחל דוד (השביל המונגש) | Nahal David accessible trail |
| 33 | desert | `qumran-ein-gedi` | גלעד ההולכים במדבר ותל גורן | Desert Hikers Memorial and Tel Goren viewpoint |
| 34 | desert | `qumran-ein-gedi` | בית הכנסת העתיק בעין גדי | Ein Gedi Ancient Synagogue |
| 35 | desert | `mount-sodom` | הר סדום - עצירה ראשונה (שביל הדגים) | Mount Sodom first geology stop (Fish Trail) |
| 36 | desert | `mount-sodom` | תצפית הר סדום | Mount Sodom viewpoint |
| 37 | desert | `mount-sodom` | נחל בוקק | Nahal Bokek geology guidance point |
| 38 | desert | `mount-sodom` | תצפית נחל זוהר ומצד זוהר | Western Nahal Zohar viewpoint |
| 39 | galilee-valleys | `lower-galilee-christianity` | נצרת – חצר מקאם שהאב א-דין | Maqam Shihab al-Din, Nazareth |
| 40 | golan | `golan-campus-day-three` | מרפסת מסעדת סלים שופי – בריכת רם | Salim Shufi terrace overlooking Birkat Ram |
| 41 | golan | `golan-campus-day-three` | מרומי החרמון – עמק בולען ובקתת האלפיניסטים | Bolan Valley and Alpinists Hut, Mount Hermon |
| 42 | golan | `golan-campus-day-three` | שביל ההליכה במרומי החרמון – תצפית לשלוחות ולדרום לבנון | Mount Hermon walking trail viewpoint |
| 43 | golan | `golan-campus-day-three` | מרומי החרמון – גבעות הקרב | Battle Hills, Mount Hermon |
| 44 | golan | `golan-campus-day-three` | שמורת טבע תל דן – מבואת השמורה ובריכת השכשוך | Tel Dan wading pool |
| 45 | golan | `south-golan` | שמורת טבע גמלא – מצפור הנשרים | Gamla vulture observatory |
| 46 | golan | `south-golan` | קיבוץ האון – קו אידן | Eden Line anti-tank obstacles, HaOn |
| 47 | golan | `south-golan` | קיבוץ האון – עץ הפיקוס הבנגלי | Banyan tree, HaOn |
| 48 | jerusalem | `old-city-christianity` | תחנות 3 ו-4 בוויה דולורוזה (רחוב הגיא) | Via Dolorosa Stations III and IV |
| 49 | jerusalem | `old-city-christianity` | תחנה 5 בוויה דולורוזה | Via Dolorosa Station V |
| 50 | jerusalem | `old-city-christianity` | תחנה 7 בוויה דולורוזה | Via Dolorosa Station VII |
| 51 | jerusalem | `old-city-christianity` | תחנה 8 בוויה דולורוזה | Via Dolorosa Station VIII |
| 52 | jerusalem | `old-city-christianity` | תחנה 9 בוויה דולורוזה | Via Dolorosa Station IX |
| 53 | jerusalem | `jerusalem-campus-day-one` | מעלה גיא בן הינום (עצירת תצפית והסבר בדרך לכתף הינום) | Hinnom Valley ascent viewpoint |
| 54 | jerusalem | `jerusalem-campus-day-two` | תצפית רכס ארמון הנציב (ביציאה ממנהרת האמה) | Armon HaNatziv aqueduct exit viewpoint |
| 55 | jerusalem | `jerusalem-campus-day-three` | מנהרות הכותל - אמת המים החשמונאית ובריכת סטרותיון | Hasmonean aqueduct and Struthion Pool |
| 56 | samaria-sharon | `samaria-shilat-gerizim` | הר גריזים - מתחם המקדש השומרוני | Mount Gerizim Samaritan Temple |
| 57 | samaria-sharon | `samaria-shilat-gerizim` | הר גריזים - הכנסייה הביזנטית המתומנת (מריה התיאוטוקוס) | Mount Gerizim Theotokos Church |
| 58 | samaria-sharon | `tanninim-jisr-pardes-hanna` | עין תגית (נחל תנינים) | Ein Tagit, Nahal Tanninim |
| 59 | samaria-sharon | `tanninim-jisr-pardes-hanna` | שמורת טבע נחל תנינים (הסכר ותחנות הקמח) | Nahal Tanninim dam and mills |
| 60 | samaria-sharon | `tanninim-jisr-pardes-hanna` | שפך נחל תנינים וג'סר א-זרקא (גשר הקיסר וילהלם השני ותל קרוקודילופוליס) | Tanninim estuary and Kaiser Wilhelm Bridge |
| 61 | samaria-sharon | `tanninim-jisr-pardes-hanna` | בית הדואר (כרכור) | Old Post Office, Karkur |
| 62 | samaria-sharon | `tanninim-jisr-pardes-hanna` | גלריית בית לים (רחוב הראשונים, פרדס חנה) | Beit Lim Gallery, Pardes Hanna |
| 63 | samaria-sharon | `tanninim-jisr-pardes-hanna` | השוק הישן ובית קלייה רוסטר (פרדס חנה) | Old Market and Roaster coffee workshop |
| 64 | samaria-sharon | `tanninim-jisr-pardes-hanna` | מתחם אורוות האמנים (בית הספר החקלאי, פרדס חנה) | Artists Stables, Pardes Hanna |
