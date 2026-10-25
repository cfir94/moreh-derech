import type { Era } from "./roman-people";

export type StoryEvent = {id: string; title: string; text: string; art?: number; sources: string[]};
export type StoryRow = {year: number; date: string; people: string[]; event?: StoryEvent};
export type StoryChapter = {id: string; number: string; title: string; range: string; era: Era; intro: string; rows: StoryRow[]};
export type StoryRelation = {id: string; from: string; to: string; kind: "family" | "succession" | "power"; label: string; sources: string[]};

// Row dates are learning anchors, distinct from reign/office dates on every node.
// Top-to-bottom sequence is chronological; distances are not proportional to time.
export const STORY_CHAPTERS: StoryChapter[] = [
  {
    "id": "entry",
    "number": "I",
    "title": "רומא נכנסת, הורדוס עולה",
    "range": "63–4 לפנה״ס",
    "era": "conquest",
    "intro": "סכסוך חשמונאי פותח את הדלת לרומא. הורדוס בונה ממלכה, אבל אישור השלטון נשאר ברומא.",
    "rows": [
      {
        "year": -63,
        "date": "63 לפנה״ס",
        "people": [
          "pompey"
        ],
        "event": {
          "id": "conquest",
          "title": "סוף העצמאות החשמונאית",
          "text": "פומפיוס כובש את ירושלים. יהודה נכנסת למרחב השליטה הרומי; עדיין מדובר ברפובליקה, לא בקיסרות.",
          "sources": [
            "temple1"
          ]
        }
      },
      {
        "year": -40,
        "date": "40–27 לפנה״ס",
        "people": [
          "antony",
          "herod-great",
          "augustus"
        ],
        "event": {
          "id": "herod",
          "title": "ממלכת הורדוס בחסות רומא",
          "text": "מינוי ב־40, כיבוש ירושלים ב־37. אחרי אקטיום ב־31 הורדוס מעביר את נאמנותו מאנטוניוס לאוקטביאנוס, שמאשר את שלטונו. אוקטביאנוס מקבל את התואר אוגוסטוס ב־27.",
          "art": 0,
          "sources": [
            "temple1",
            "metRoman"
          ]
        }
      },
      {
        "year": -4,
        "date": "4 לפנה״ס",
        "people": [
          "varus",
          "antipas"
        ],
        "event": {
          "id": "partition",
          "title": "מות הורדוס וחלוקת הממלכה",
          "text": "ארכלאוס מקבל את יהודה, שומרון ואדומיאה; אנטיפס את הגליל ועבר הירדן; פיליפוס נחלות בצפון־מזרח. המהומות מדוכאות בידי ורוס, מושל סוריה.",
          "sources": [
            "temple2"
          ]
        }
      }
    ]
  },
  {
    "id": "governors",
    "number": "II",
    "title": "נציבים ומלך יהודי אחרון ביהודה",
    "range": "6–44 לספירה",
    "era": "conquest",
    "intro": "שלטון ישיר ביהודה מתקיים לצד שליטי חסות בגליל. החזרה למלכות ב־41 היא הפסקה קצרה בנציבות.",
    "rows": [
      {
        "year": 6,
        "date": "6 לספירה",
        "people": [
          "quirinius"
        ],
        "event": {
          "id": "first-prefects",
          "title": "תקופת הנציבים הראשונה · 6–41",
          "text": "אוגוסטוס מדיח את ארכלאוס. יהודה עוברת לנציבות רומית, וקויריניוס עורך מפקד לצורכי מס. בגליל ובעבר הירדן ממשיך אנטיפס לשלוט.",
          "sources": [
            "temple2"
          ]
        }
      },
      {
        "year": 14,
        "date": "14–36",
        "people": [
          "tiberius",
          "pilate"
        ],
        "event": {
          "id": "jesus",
          "title": "טבריה, פילטוס וראשית הסיפור הנוצרי",
          "text": "אנטיפס מייסד את טבריה סביב שנת 20 וקורא לה על שם טיבריוס. בימי פילטוס נשפט ישוע ונצלב בירושלים, סביב שנת 30. הנצרות עדיין אינה דת האימפריה.",
          "sources": [
            "temple2",
            "tiberias"
          ]
        }
      },
      {
        "year": 37,
        "date": "37–41",
        "people": [
          "caligula",
          "agrippa1"
        ],
        "event": {
          "id": "statue",
          "title": "משבר הפסל והתרחבות ממלכת אגריפס",
          "text": "קליגולה מעניק לאגריפס נחלות, ובהמשך גם את נחלות אנטיפס שהוגלה. דרישתו להציב פסל במקדש בירושלים אינה מתממשת לפני מותו.",
          "sources": [
            "temple2",
            "agrippa"
          ]
        }
      },
      {
        "year": 41,
        "date": "41–44",
        "people": [
          "claudius"
        ],
        "event": {
          "id": "last-king",
          "title": "אגריפס הראשון · המלך היהודי האחרון ששלט ביהודה",
          "text": "קלאודיוס מוסיף לממלכתו את יהודה ושומרון. עם מותו ב־44 מתחדשת הנציבות. בנו, אגריפס השני, יהיה המלך האחרון לבית הורדוס, אך לא מלך יהודה כאביו.",
          "sources": [
            "temple2",
            "agrippa",
            "agrippa2"
          ]
        }
      }
    ]
  },
  {
    "id": "revolt",
    "number": "III",
    "title": "מהנציבות אל המרד והחורבן",
    "range": "44–70",
    "era": "conquest",
    "intro": "מבינים את שרשרת האחריות: הקיסר שולח, המצביא נלחם, והבן מכריע את ירושלים.",
    "rows": [
      {
        "year": 44,
        "date": "44–66",
        "people": [
          "nero",
          "florus",
          "cestius"
        ],
        "event": {
          "id": "second-prefects",
          "title": "תקופת הנציבים השנייה · 44–66",
          "text": "לאחר מות אגריפס הראשון חוזר השלטון הישיר. פלורוס הוא הנציב בעת פרוץ המרד ב־66; קסטיוס גאלוס, מושל סוריה, נכשל בניסיון לדכא אותו. עם המרד מסתיימת תקופת הנציבים במתכונת זו.",
          "sources": [
            "temple2",
            "nero"
          ]
        }
      },
      {
        "year": 67,
        "date": "67–70",
        "people": [
          "vespasian",
          "titus"
        ],
        "event": {
          "id": "destruction",
          "title": "70 · חורבן ירושלים ובית המקדש",
          "text": "אספסיאנוס כובש תחילה את הגליל. אחרי עלייתו לקיסרות ב־69, טיטוס מוביל את המצור על ירושלים ב־70. טיטוס הוא כאן מצביא; קיסר יהיה רק ב־79. ההתנגדות במבצרים נמשכת גם אחרי החורבן.",
          "art": 1,
          "sources": [
            "temple2",
            "mishnah"
          ]
        }
      }
    ]
  },
  {
    "id": "after-temple",
    "number": "IV",
    "title": "אחרי החורבן: מסים, תפוצות ומרד נוסף",
    "range": "81–180",
    "era": "empire",
    "intro": "הסיפור היהודי ממשיך בארץ ובתפוצות. מרד התפוצות ומרד בר כוכבא הם שני אירועים שונים.",
    "rows": [
      {
        "year": 81,
        "date": "81–98",
        "people": [
          "domitian",
          "nerva"
        ],
        "event": {
          "id": "flavians",
          "title": "מהפלאבים אל הקיסרים הטובים",
          "text": "דומיטיאנוס הוא בנו של אספסיאנוס ואחיו של טיטוס. נרבה עולה אחריו ב־96 ומאמץ את טריאנוס ליורש. זו אינה המשכיות של משפחה ביולוגית אחת.",
          "sources": [
            "mishnah",
            "metRoman"
          ]
        }
      },
      {
        "year": 98,
        "date": "98–117",
        "people": [
          "trajan",
          "quietus"
        ],
        "event": {
          "id": "diaspora",
          "title": "106 · ערביה | 115–117 · מרד התפוצות",
          "text": "טריאנוס מספח את הממלכה הנבטית. בהמשך פורץ מרד בקהילות יהודיות במצרים, בקירנאיקה, בקפריסין ובמסופוטמיה. קיטוס הוא מצביא הפועל בדיכוי, ולא הקיסר.",
          "sources": [
            "mishnah"
          ]
        }
      },
      {
        "year": 117,
        "date": "117–138",
        "people": [
          "hadrian"
        ],
        "event": {
          "id": "bar-kokhba",
          "title": "132–135 · מרד בר כוכבא",
          "text": "שמעון בר כוסבה מוביל את המרד בימי אדריאנוס. דיכויו מביא חורבן ופגיעה קשה ביישוב היהודי. איליה קפיטולינה, ביתר ומערות מדבר יהודה הם עוגנים בשטח; סדר ייסוד העיר והמרד שנוי במחלוקת בין המקורות.",
          "art": 2,
          "sources": [
            "late"
          ]
        }
      },
      {
        "year": 138,
        "date": "138–180",
        "people": [
          "pius",
          "marcus"
        ],
        "event": {
          "id": "good-emperors",
          "title": "המשך רצף הקיסרים הטובים",
          "text": "אנטונינוס פיוס ואחריו מרקוס אורליוס חותמים את הרצף שנלמד בקורס. ״שלום רומי״ הוא מסגרת אימפריאלית; הוא אינו מבטל את ההרס שחוו היהודים במרידות.",
          "sources": [
            "mishnah",
            "metRoman"
          ]
        }
      }
    ]
  },
  {
    "id": "reform",
    "number": "V",
    "title": "ערים חדשות וסדר אימפריאלי חדש",
    "range": "193–305",
    "era": "empire",
    "intro": "ממעמד הערים בארץ אל ניסיון לייצב אימפריה עצומה באמצעות חלוקת השלטון.",
    "rows": [
      {
        "year": 193,
        "date": "193–217",
        "people": [
          "severus",
          "caracalla"
        ],
        "event": {
          "id": "severans",
          "title": "השושלת הסוורית והמרחב העירוני",
          "text": "ספטימיוס סוורוס הוא אביו של קרקלה. לוד–דיוספוליס, בית גוברין–אלאותרופוליס וסבסטיה הן עוגנים לשינוי עירוני. הזיהוי של קרקלה עם ״אנטונינוס״ ידיד רבי הוא הצעה, לא ודאות.",
          "sources": [
            "late"
          ]
        }
      },
      {
        "year": 284,
        "date": "284–305",
        "people": [
          "diocletian"
        ],
        "event": {
          "id": "tetrarchy",
          "title": "טטררכיה · שני אוגוסטוסים ושני קיסרי משנה",
          "text": "ארבעה בעלי תפקיד בתוך אימפריה אחת. בארץ נקשרת התקופה בהעברת הלגיון העשירי מירושלים לאיילה ובמערך הגנה בדרום. לאחר הפרישה ב־305 נמשכים מאבקי הירושה.",
          "sources": [
            "late",
            "byz"
          ]
        }
      }
    ]
  },
  {
    "id": "christian",
    "number": "VI",
    "title": "הקיסרות פונה לנצרות",
    "range": "306–363",
    "era": "byzantine",
    "intro": "היתר לפולחן, איחוד השלטון, כנסיות בארץ וניסיון קצר להפוך את הכיוון.",
    "rows": [
      {
        "year": 306,
        "date": "306–324",
        "people": [
          "constantine",
          "maxentius",
          "licinius"
        ],
        "event": {
          "id": "christian-rise",
          "title": "312 ← 313 ← 324 ← 325",
          "text": "312: ניצחון קונסטנטינוס על מקסנטיוס. 313: הסדר מילאנו עם ליקיניוס מתיר פולחן נוצרי. 324: הכרעת ליקיניוס ואיחוד האימפריה. 325: ועידת ניקיה. אלה ארבע תחנות שונות.",
          "art": 3,
          "sources": [
            "byz"
          ]
        }
      },
      {
        "year": 324,
        "date": "שנות ה־320",
        "people": [
          "helena"
        ],
        "event": {
          "id": "churches",
          "title": "הלנה, צליינות והגאוגרפיה הקדושה",
          "text": "אמו של קונסטנטינוס נקשרת במסורת למסע בארץ ולמפעלי הכנסיות. כנסיית הקבר, כנסיית המולד ואלאונה שייכות למפעל הקונסטנטיני; לא כל פרט במסורת הוא ייחוס אישי ודאי להלנה.",
          "sources": [
            "byz"
          ]
        }
      },
      {
        "year": 337,
        "date": "337–363",
        "people": [
          "constantius",
          "gallus",
          "julian"
        ],
        "event": {
          "id": "gallus-julian",
          "title": "351 · מרד גאלוס | 363 · ניסיון חידוש המקדש",
          "text": "המרד היהודי בגליל מדוכא בימי קונסטנטיוס השני, בידי שליט המשנה גאלוס. יוליאנוס, בהמשך הרצף, מנסה להחזיר את הפולחן הפגני ולקדם בנייה מחדש של המקדש; היוזמה אינה מושלמת.",
          "sources": [
            "byz"
          ]
        }
      }
    ]
  },
  {
    "id": "byzantium",
    "number": "VII",
    "title": "מדינה נוצרית, ירושלים ביזנטית",
    "range": "379–565",
    "era": "byzantine",
    "intro": "הקיסרות נוצרית, אך בארץ ממשיכים להתקיים גם יהודים ושומרונים. בודקים מי שלט, מי בנה ומתי.",
    "rows": [
      {
        "year": 379,
        "date": "379–395",
        "people": [
          "theodosius1"
        ],
        "event": {
          "id": "state-religion",
          "title": "380 · דת המדינה | 395 · מזרח ומערב",
          "text": "בימי תאודוסיוס הראשון הופכת הנצרות הניקיאנית לדת המדינה. לאחר מותו מתחלק השלטון למזרח ולמערב; ארץ ישראל נשארת בחלק המזרחי של האימפריה הרומית.",
          "sources": [
            "byz"
          ]
        }
      },
      {
        "year": 408,
        "date": "408–460",
        "people": [
          "theodosius2",
          "eudocia"
        ],
        "event": {
          "id": "patriarchate",
          "title": "429 · ביטול הנשיאות | אאודוקיה בירושלים",
          "text": "בימי תאודוסיוס השני מבוטל מוסד הנשיאות היהודית. אשתו אאודוקיה פועלת בירושלים ונקשרת לחומות ולכנסיית סטפנוס. היעלמות מוסד ההנהגה אינה סוף החיים היהודיים או בתי הכנסת.",
          "sources": [
            "byz"
          ]
        }
      },
      {
        "year": 527,
        "date": "527–565",
        "people": [
          "justinian"
        ],
        "event": {
          "id": "justinian-building",
          "title": "יוסטיניאנוס · בנייה וחקיקה",
          "text": "הניאה בירושלים וכנסיית המולד בבית לחם הן עוגני מפעל הבנייה. לצדם נלמדים החרפת החקיקה כלפי יהודים ודיכוי מרידות שומרונים — אוכלוסיות שונות שיש להבחין ביניהן.",
          "art": 4,
          "sources": [
            "byz"
          ]
        }
      }
    ]
  },
  {
    "id": "end",
    "number": "VIII",
    "title": "סוף השלטון הביזנטי בארץ",
    "range": "610–638",
    "era": "byzantine",
    "intro": "כיבוש פרסי, שיבה ביזנטית קצרה והכיבוש המוסלמי. השלטון בארץ מסתיים לפני סוף כהונת הקיסר.",
    "rows": [
      {
        "year": 610,
        "date": "610–638",
        "people": [
          "heraclius"
        ],
        "event": {
          "id": "end-byzantine",
          "title": "614 · פרסים | 636 · ירמוך | 638 · ירושלים",
          "text": "הפרסים כובשים את ירושלים ב־614. הרקליוס מחזיר את השליטה הביזנטית לזמן קצר; לאחר ירמוך ב־636 נכבשת גם ירושלים ב־638. הרקליוס נשאר קיסר עד 641, אך ארץ ישראל כבר אינה בשליטתו.",
          "art": 5,
          "sources": [
            "byz",
            "heraclius"
          ]
        }
      }
    ]
  }
];
export const STORY_RELATIONS: StoryRelation[] = [
  {
    "id": "rel-1",
    "from": "antony",
    "to": "herod-great",
    "kind": "power",
    "label": "תומך במינויו למלך · 40 לפנה״ס",
    "sources": [
      "temple1"
    ]
  },
  {
    "id": "rel-2",
    "from": "augustus",
    "to": "herod-great",
    "kind": "power",
    "label": "מאשר את המשך שלטונו אחרי אקטיום",
    "sources": [
      "temple1"
    ]
  },
  {
    "id": "rel-3",
    "from": "herod-great",
    "to": "antipas",
    "kind": "family",
    "label": "אב ובנו",
    "sources": [
      "temple2"
    ]
  },
  {
    "id": "rel-4",
    "from": "herod-great",
    "to": "agrippa1",
    "kind": "family",
    "label": "סב ונכדו",
    "sources": [
      "temple2"
    ]
  },
  {
    "id": "rel-5",
    "from": "tiberius",
    "to": "pilate",
    "kind": "power",
    "label": "קיסר ונציב ביהודה בתקופתו",
    "sources": [
      "temple2"
    ]
  },
  {
    "id": "rel-6",
    "from": "caligula",
    "to": "agrippa1",
    "kind": "power",
    "label": "מעניק נחלות למלך החסות",
    "sources": [
      "temple2"
    ]
  },
  {
    "id": "rel-7",
    "from": "claudius",
    "to": "agrippa1",
    "kind": "power",
    "label": "מעניק לו את יהודה · 41",
    "sources": [
      "temple2",
      "agrippa"
    ]
  },
  {
    "id": "rel-8",
    "from": "nero",
    "to": "vespasian",
    "kind": "power",
    "label": "שולח לדכא את המרד · 67",
    "sources": [
      "nero"
    ]
  },
  {
    "id": "rel-9",
    "from": "vespasian",
    "to": "titus",
    "kind": "family",
    "label": "אב ובנו · הבן ממשיך את המערכה",
    "sources": [
      "temple2",
      "mishnah"
    ]
  },
  {
    "id": "rel-10",
    "from": "vespasian",
    "to": "domitian",
    "kind": "family",
    "label": "אב ובנו",
    "sources": [
      "mishnah"
    ]
  },
  {
    "id": "rel-11",
    "from": "titus",
    "to": "domitian",
    "kind": "family",
    "label": "אחים · דומיטיאנוס יורש את טיטוס",
    "sources": [
      "mishnah"
    ]
  },
  {
    "id": "rel-12",
    "from": "domitian",
    "to": "nerva",
    "kind": "succession",
    "label": "נרבה עולה אחריו · 96",
    "sources": [
      "mishnah"
    ]
  },
  {
    "id": "rel-13",
    "from": "nerva",
    "to": "trajan",
    "kind": "family",
    "label": "אימוץ וירושה · לא אב ביולוגי",
    "sources": [
      "metRoman"
    ]
  },
  {
    "id": "rel-14",
    "from": "trajan",
    "to": "quietus",
    "kind": "power",
    "label": "קיסר ומצביא בדיכוי מרד התפוצות",
    "sources": [
      "mishnah"
    ]
  },
  {
    "id": "rel-15",
    "from": "trajan",
    "to": "hadrian",
    "kind": "succession",
    "label": "אדריאנוס עולה אחריו · 117",
    "sources": [
      "mishnah",
      "late"
    ]
  },
  {
    "id": "rel-16",
    "from": "hadrian",
    "to": "pius",
    "kind": "succession",
    "label": "אנטונינוס פיוס עולה אחריו · 138",
    "sources": [
      "mishnah"
    ]
  },
  {
    "id": "rel-17",
    "from": "pius",
    "to": "marcus",
    "kind": "family",
    "label": "אימוץ וירושה · לא אב ביולוגי",
    "sources": [
      "metRoman"
    ]
  },
  {
    "id": "rel-18",
    "from": "severus",
    "to": "caracalla",
    "kind": "family",
    "label": "אב ובנו · השושלת הסוורית",
    "sources": [
      "late"
    ]
  },
  {
    "id": "rel-19",
    "from": "constantine",
    "to": "maxentius",
    "kind": "power",
    "label": "יריבים · קרב גשר מילביוס, 312",
    "sources": [
      "byz"
    ]
  },
  {
    "id": "rel-20",
    "from": "constantine",
    "to": "licinius",
    "kind": "power",
    "label": "שותפים ב־313, יריבים עד ההכרעה ב־324",
    "sources": [
      "byz"
    ]
  },
  {
    "id": "rel-21",
    "from": "helena",
    "to": "constantine",
    "kind": "family",
    "label": "אם ובנה",
    "sources": [
      "byz"
    ]
  },
  {
    "id": "rel-22",
    "from": "constantine",
    "to": "constantius",
    "kind": "family",
    "label": "אב ובנו",
    "sources": [
      "byz"
    ]
  },
  {
    "id": "rel-23",
    "from": "constantius",
    "to": "gallus",
    "kind": "power",
    "label": "קיסר ראשי ושליט משנה",
    "sources": [
      "byz"
    ]
  },
  {
    "id": "rel-24",
    "from": "theodosius2",
    "to": "eudocia",
    "kind": "family",
    "label": "בעל ואישה",
    "sources": [
      "byz"
    ]
  }
];
