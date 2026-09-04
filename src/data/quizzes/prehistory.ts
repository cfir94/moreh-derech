// Split out of the old "תקופות היסטוריות" quiz by
// tools/split_history_quiz.py. Edit through tools/quiz_edits/prehistory.json and
// tools/apply_quiz_edits.py — not by hand.
import type { Quiz } from "@/data/quizzes/types";

const quiz: Quiz = {
  "slug": "prehistory",
  "label": "פרהיסטוריה",
  "categories": [
    "מבוא לפרהיסטוריה ואבולוציית האדם",
    "פליאולית",
    "אפיפליאולית והתרבות הנטופית",
    "ניאולית וכלקוליתי"
  ],
  "questions": [
    {
      "id": 1,
      "question": "מהי המשמעות המילולית של המונח \"פרהיסטוריה\"?",
      "category": "מבוא לפרהיסטוריה ואבולוציית האדם",
      "answers": [
        {
          "text": "\"ההיסטוריה הקדומה\" — שם נרדף פשוט להיסטוריה עתיקה",
          "correct": false
        },
        {
          "text": "\"סיפורי העבר\" — מונח יווני למיתולוגיה עממית",
          "correct": false
        },
        {
          "text": "\"לפני האדם\" — התקופה שקדמה להופעת האדם על פני כדור הארץ",
          "correct": false
        },
        {
          "text": "\"לפני הכתיבה\" — התקופה שקדמה להמצאת הכתב",
          "correct": true
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 2,
      "question": "איזה חלק מזמן קיומו של האדם מכוסה בתיעוד כתוב (היסטוריה)?",
      "category": "מבוא לפרהיסטוריה ואבולוציית האדם",
      "answers": [
        {
          "text": "כרבע מהזמן",
          "correct": false
        },
        {
          "text": "כמחצית מהזמן",
          "correct": false
        },
        {
          "text": "פחות מאחוז אחד בלבד",
          "correct": true
        },
        {
          "text": "כעשרה אחוזים",
          "correct": false
        }
      ],
      "topic": "geography"
    },
    {
      "id": 3,
      "question": "כיצד בעיקר חוקרים את תקופת הפרהיסטוריה, בהיעדר תיעוד כתוב?",
      "category": "מבוא לפרהיסטוריה ואבולוציית האדם",
      "answers": [
        {
          "text": "באמצעות תעודות מצריות ומסופוטמיות בלבד",
          "correct": false
        },
        {
          "text": "אך ורק באמצעות ממצאים ארכיאולוגיים",
          "correct": true
        },
        {
          "text": "באמצעות מסורות בעל-פה שהועברו מדור לדור",
          "correct": false
        },
        {
          "text": "באמצעות ניתוח גנטי של אוכלוסיות מודרניות בלבד",
          "correct": false
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 4,
      "question": "לפי רשימת \"המהפכות החשובות בתולדות האדם\", מתי (בשנים לפני זמננו) מתוארכות גדילת המוח ותחילת ייצור כלי האבן?",
      "category": "מבוא לפרהיסטוריה ואבולוציית האדם",
      "answers": [
        {
          "text": "790,000 שנה",
          "correct": false
        },
        {
          "text": "11,000 שנה",
          "correct": false
        },
        {
          "text": "2.5 מיליון שנה",
          "correct": true
        },
        {
          "text": "15,000 שנה",
          "correct": false
        }
      ],
      "topic": "geography"
    },
    {
      "id": 5,
      "question": "מתי מתוארכת היציאה הראשונה של האדם מאפריקה?",
      "category": "מבוא לפרהיסטוריה ואבולוציית האדם",
      "answers": [
        {
          "text": "2.5 מיליון שנה לפני זמננו",
          "correct": false
        },
        {
          "text": "200,000 שנה לפני זמננו",
          "correct": false
        },
        {
          "text": "50,000 שנה לפני זמננו",
          "correct": false
        },
        {
          "text": "1.8 מיליון שנה לפני זמננו",
          "correct": true
        }
      ],
      "topic": "geography"
    },
    {
      "id": 6,
      "question": "מתי, לפי הממצאים, השתלט האדם על האש?",
      "category": "מבוא לפרהיסטוריה ואבולוציית האדם",
      "answers": [
        {
          "text": "כ-15,000 שנה לפני זמננו",
          "correct": false
        },
        {
          "text": "כ-50,000 שנה לפני זמננו",
          "correct": false
        },
        {
          "text": "כ-2.5 מיליון שנה לפני זמננו",
          "correct": false
        },
        {
          "text": "כ-790,000 שנה לפני זמננו",
          "correct": true
        }
      ],
      "topic": "geography"
    },
    {
      "id": 7,
      "question": "מתי מוערכת תחילת ההתיישבות בקבע ובניית בתים לראשונה?",
      "category": "מבוא לפרהיסטוריה ואבולוציית האדם",
      "answers": [
        {
          "text": "כ-15,000 שנה לפני זמננו",
          "correct": true
        },
        {
          "text": "כ-6,000 שנה לפני זמננו",
          "correct": false
        },
        {
          "text": "כ-250,000 שנה לפני זמננו",
          "correct": false
        },
        {
          "text": "כ-1.8 מיליון שנה לפני זמננו",
          "correct": false
        }
      ],
      "topic": "geography"
    },
    {
      "id": 8,
      "question": "מתי מוערכת הופעת הכתב, המסמנת את תחילת ההיסטוריה וסיום העידן הפרהיסטורי באזורנו?",
      "category": "מבוא לפרהיסטוריה ואבולוציית האדם",
      "answers": [
        {
          "text": "כ-5,000 שנה לפני זמננו (כ-3,000 לפני הספירה)",
          "correct": true
        },
        {
          "text": "כ-11,000 שנה לפני זמננו",
          "correct": false
        },
        {
          "text": "כ-1,000 שנה לפני זמננו",
          "correct": false
        },
        {
          "text": "כ-790,000 שנה לפני זמננו",
          "correct": false
        }
      ],
      "topic": "islam"
    },
    {
      "id": 9,
      "question": "מהי \"Out of Africa 2\"?",
      "category": "מבוא לפרהיסטוריה ואבולוציית האדם",
      "answers": [
        {
          "text": "שם התיאוריה על מקור האדם באסיה ולא באפריקה",
          "correct": false
        },
        {
          "text": "היציאה הראשונה מאפריקה של קדמוני האדם לפני 1.8 מיליון שנה",
          "correct": false
        },
        {
          "text": "מסע ארכיאולוגי מודרני לחקר אפריקה במאה ה-20",
          "correct": false
        },
        {
          "text": "תפוצה כלל-עולמית שנייה של האדם מאפריקה, של מין ההומו ספיינס",
          "correct": true
        }
      ],
      "topic": "geography"
    },
    {
      "id": 10,
      "question": "לאיזה טווח תאריכים מתוארכת \"Out of Africa 2\"?",
      "category": "מבוא לפרהיסטוריה ואבולוציית האדם",
      "answers": [
        {
          "text": "כ-15,000–11,000 שנה לפני זמננו",
          "correct": false
        },
        {
          "text": "כ-190,000–160,000 שנה לפני זמננו",
          "correct": true
        },
        {
          "text": "כ-50,000–20,000 שנה לפני זמננו",
          "correct": false
        },
        {
          "text": "כ-2.5–1.8 מיליון שנה לפני זמננו",
          "correct": false
        }
      ],
      "topic": "geography"
    },
    {
      "id": 11,
      "question": "אילו שני טיפוסי אדם קשורים ל\"Out of Africa 2\" ומצויים יחד בהקשר זה?",
      "category": "מבוא לפרהיסטוריה ואבולוציית האדם",
      "answers": [
        {
          "text": "ניאנדרטלים והומו ארקטוס בלבד",
          "correct": false
        },
        {
          "text": "הומו ספיינס בלבד, ללא מיני אדם נוספים",
          "correct": false
        },
        {
          "text": "הומו ספיינס וניאנדרטלים",
          "correct": true
        },
        {
          "text": "הומו ארקטוס והומו הבילוס",
          "correct": false
        }
      ],
      "topic": "modern-yishuv"
    },
    {
      "id": 12,
      "question": "מהי \"רצף השכבות בנחל מערות\" (טבלת הסינכרון)?",
      "category": "מבוא לפרהיסטוריה ואבולוציית האדם",
      "answers": [
        {
          "text": "טבלה המסנכרנת בין שכבות המערות לתקופות הפרהיסטוריה",
          "correct": true
        },
        {
          "text": "רשימת הממצאים שנחשפו בשמורת נחל מערות בכל שנה",
          "correct": false
        },
        {
          "text": "מפת השבילים והמערות של שמורת נחל מערות כיום",
          "correct": false
        },
        {
          "text": "שם נוסף לרצף התרבות הנטופית בגליל ובכרמל",
          "correct": false
        }
      ],
      "explanation": "מערות התנור, הגדי והנחל שבנחל מערות מכילות רצף אנושי של כ-500 אלף שנה — ולכן הן אתר מורשת עולמית.",
      "topic": "prehistory"
    },
    {
      "id": 13,
      "question": "לאיזה טווח תאריכים מתוארך הפליאולית התחתון?",
      "category": "פליאולית",
      "answers": [
        {
          "text": "כ-1.5 מיליון עד 250,000 שנה לפני זמננו",
          "correct": true
        },
        {
          "text": "כ-50,000 עד 20,000 שנה לפני זמננו",
          "correct": false
        },
        {
          "text": "כ-20,000 עד 10,000 שנה לפני זמננו",
          "correct": false
        },
        {
          "text": "כ-250,000 עד 50,000 שנה לפני זמננו",
          "correct": false
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 14,
      "question": "מהי התרבות האופיינית לפליאולית התחתון בארץ ישראל?",
      "category": "פליאולית",
      "answers": [
        {
          "text": "התרבות הנטופית",
          "correct": false
        },
        {
          "text": "התרבות האשלית",
          "correct": true
        },
        {
          "text": "התרבות המוסטרית",
          "correct": false
        },
        {
          "text": "התרבות האוריניאקית",
          "correct": false
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 15,
      "question": "מהו הכלי האופייני ביותר לתרבות האשלית?",
      "category": "פליאולית",
      "answers": [
        {
          "text": "אבן יד",
          "correct": true
        },
        {
          "text": "מכתשת אבן",
          "correct": false
        },
        {
          "text": "ראש חץ מחודד",
          "correct": false
        },
        {
          "text": "להב סכין דק",
          "correct": false
        }
      ],
      "topic": "geology"
    },
    {
      "id": 16,
      "question": "אילו מהאתרים הבאים בארץ ישראל מיוחסים לפליאולית התחתון?",
      "category": "פליאולית",
      "answers": [
        {
          "text": "עובדיה, גשר בנות יעקב וביצת רוחמה",
          "correct": true
        },
        {
          "text": "מערת קסם, נחל מערות וכפר החורש",
          "correct": false
        },
        {
          "text": "יריחו, נחל אורן ומעין ברוך",
          "correct": false
        },
        {
          "text": "עין גדי, מצדה ותל דן",
          "correct": false
        }
      ],
      "explanation": "עובדיה שבבקעת הירדן היא מהאתרים הקדומים ביותר מחוץ לאפריקה — כ-1.4 מיליון שנה.",
      "topic": "prehistory"
    },
    {
      "id": 17,
      "question": "מה היה בסיס הקיום העיקרי של האדם בפליאולית התחתון?",
      "category": "פליאולית",
      "answers": [
        {
          "text": "איסוף פגרי בעלי חיים (נבלות), ולעיתים ציד חיות גדולות",
          "correct": true
        },
        {
          "text": "רעיית צאן ובקר בעדרים גדולים",
          "correct": false
        },
        {
          "text": "חקלאות שלחין וגידול דגנים",
          "correct": false
        },
        {
          "text": "דיג ואיסוף רכיכות בלבד",
          "correct": false
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 18,
      "question": "לאיזה טווח תאריכים מתוארך הפליאולית התיכון?",
      "category": "פליאולית",
      "answers": [
        {
          "text": "כ-1.5 מיליון עד 250,000 שנה לפני זמננו",
          "correct": false
        },
        {
          "text": "כ-11,000 עד 6,000 שנה לפני זמננו",
          "correct": false
        },
        {
          "text": "כ-250,000 עד 50,000 שנה לפני זמננו",
          "correct": true
        },
        {
          "text": "כ-6,500 עד 5,500 שנה לפני זמננו",
          "correct": false
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 19,
      "question": "מהי התרבות האופיינית לפליאולית התיכון?",
      "category": "פליאולית",
      "answers": [
        {
          "text": "התרבות האשלית",
          "correct": false
        },
        {
          "text": "התרבות הכבארית",
          "correct": false
        },
        {
          "text": "התרבות הירמוכית",
          "correct": false
        },
        {
          "text": "התרבות המוסטרית",
          "correct": true
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 20,
      "question": "מהי טכניקת הסיתות המתוחכמת המאפיינת את התקופה המוסטרית?",
      "category": "פליאולית",
      "answers": [
        {
          "text": "שיטת הכבישה הישירה בלבד",
          "correct": false
        },
        {
          "text": "שיטת האגרוף",
          "correct": false
        },
        {
          "text": "שיטת לבלואה",
          "correct": true
        },
        {
          "text": "שיטת אשלרו-יברודית",
          "correct": false
        }
      ],
      "topic": "geography"
    },
    {
      "id": 21,
      "question": "אילו שני טיפוסי אדם נמצאים יחד בארץ ישראל בתקופת הפליאולית התיכון?",
      "category": "פליאולית",
      "answers": [
        {
          "text": "האדם הניאנדרטלי בלבד, ללא הומו ספיינס",
          "correct": false
        },
        {
          "text": "הומו ארקטוס והומו הבילוס",
          "correct": false
        },
        {
          "text": "הומו ספיינס (אדם מודרני) והאדם הניאנדרטלי",
          "correct": true
        },
        {
          "text": "הומו ספיינס בלבד, ללא אדם ניאנדרטלי",
          "correct": false
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 22,
      "question": "אילו התפתחויות התנהגותיות \"מודרניות\" ראשוניות מופיעות לראשונה בפליאולית התיכון?",
      "category": "פליאולית",
      "answers": [
        {
          "text": "המצאת הכתב וראשית המסחר הבינלאומי",
          "correct": false
        },
        {
          "text": "ביות בעלי חיים וגידולי דגנים",
          "correct": false
        },
        {
          "text": "הקבורות הראשונות של מתים וחפצי האמנות הראשונים",
          "correct": true
        },
        {
          "text": "בניית ערים מבוצרות ומקדשים ציבוריים",
          "correct": false
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 23,
      "question": "אילו כלי נשק מתוחכמים מיוחסים לפליאולית התיכון?",
      "category": "פליאולית",
      "answers": [
        {
          "text": "כלי נשק מורכבים המיועדים לציד בנעיצת חניתות",
          "correct": true
        },
        {
          "text": "בליסטראות ומכונות מצור",
          "correct": false
        },
        {
          "text": "קשתות מורכבות ומרכבות מלחמה",
          "correct": false
        },
        {
          "text": "חרבות ברזל וכלי נשק ממתכת",
          "correct": false
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 24,
      "question": "לאיזה טווח תאריכים מתוארך הפליאולית העליון?",
      "category": "פליאולית",
      "answers": [
        {
          "text": "כ-20,000 עד 10,000 שנה לפני זמננו",
          "correct": false
        },
        {
          "text": "כ-250,000 עד 50,000 שנה לפני זמננו",
          "correct": false
        },
        {
          "text": "כ-6,500 עד 5,500 שנה לפני זמננו",
          "correct": false
        },
        {
          "text": "כ-50,000 עד 20,000 שנה לפני זמננו",
          "correct": true
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 25,
      "question": "אילו תרבויות מאפיינות את הפליאולית העליון?",
      "category": "פליאולית",
      "answers": [
        {
          "text": "הכבארית והנטופית",
          "correct": false
        },
        {
          "text": "האחמרית והאוריניאקית",
          "correct": true
        },
        {
          "text": "המוסטרית והאשלית",
          "correct": false
        },
        {
          "text": "הירמוכית והוואדי רבה",
          "correct": false
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 26,
      "question": "אילו שיפורים טכנולוגיים חדשים מופיעים בפליאולית העליון?",
      "category": "פליאולית",
      "answers": [
        {
          "text": "כלי אריגה, טקסטיל ומלכודות",
          "correct": true
        },
        {
          "text": "כלי חרס וגלגל היוצר",
          "correct": false
        },
        {
          "text": "כתב יתדות וכתב הירוגליפי",
          "correct": false
        },
        {
          "text": "כלי נחושת וזהב",
          "correct": false
        }
      ],
      "topic": "judaism"
    },
    {
      "id": 27,
      "question": "אילו אזורים בעולם יושבים לראשונה על ידי בני אדם בפליאולית העליון?",
      "category": "פליאולית",
      "answers": [
        {
          "text": "אוסטרליה, אמריקה ואזורים צפוניים",
          "correct": true
        },
        {
          "text": "אפריקה בלבד",
          "correct": false
        },
        {
          "text": "המזרח התיכון בלבד",
          "correct": false
        },
        {
          "text": "אירופה ואסיה בלבד",
          "correct": false
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 28,
      "question": "מה בולט בתרבות החומרית של הפליאולית העליון, בהשוואה לתקופות שקדמו לו?",
      "category": "פליאולית",
      "answers": [
        {
          "text": "תכשיטים, אמנות, שימוש בצבע וצלמיות",
          "correct": true
        },
        {
          "text": "בנייה בלבני בוץ ותכנון ערים ראשוני",
          "correct": false
        },
        {
          "text": "ביות בעלי חיים וראשית החקלאות",
          "correct": false
        },
        {
          "text": "ייצור כלי מתכת ראשונים מנחושת",
          "correct": false
        }
      ],
      "explanation": "בפליאולית העליון מופיעות לראשונה עדויות ל\"התנהגות מודרנית\" — סמלים ואמנות, ולא רק כלים.",
      "topic": "prehistory"
    },
    {
      "id": 137,
      "question": "איזה כלי אבן פרהיסטורי מוצג בתמונה?",
      "category": "פליאולית",
      "answers": [
        {
          "text": "אבן יד",
          "correct": true
        },
        {
          "text": "להב מגל",
          "correct": false
        },
        {
          "text": "ראש חץ מחודד",
          "correct": false
        },
        {
          "text": "כלי כתישה עגול",
          "correct": false
        }
      ],
      "image": {
        "url": "/quiz-images/history/artifacts/hand_axe.jpg",
        "fit": "contain",
        "credit": "Wikimedia Commons"
      },
      "explanation": "כלי האבן האופייני לתרבות האשלית שבפליאולית התחתון — משמש לחיתוך, לגירוד ולשבירת עצמות.",
      "topic": "prehistory"
    },
    {
      "id": 29,
      "question": "מהי מהותה של תקופת האפיפליאולית?",
      "category": "אפיפליאולית והתרבות הנטופית",
      "answers": [
        {
          "text": "התקופה שבה הופיע לראשונה הכתב באזורנו",
          "correct": false
        },
        {
          "text": "תקופת מעבר בין ציידים-לקטים ניידים (הפליאולית) לבין איכרים יושבי קבע (הניאולית)",
          "correct": true
        },
        {
          "text": "התקופה שבה האדם למד לראשונה להשתמש באש",
          "correct": false
        },
        {
          "text": "התקופה שבה קרסה התרבות העירונית הכנענית",
          "correct": false
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 30,
      "question": "לאיזה טווח תאריכים כללי מתוארכת האפיפליאולית?",
      "category": "אפיפליאולית והתרבות הנטופית",
      "answers": [
        {
          "text": "כ-20,000 עד 10,000 שנה לפני זמננו",
          "correct": true
        },
        {
          "text": "כ-1.5 מיליון עד 250,000 שנה לפני זמננו",
          "correct": false
        },
        {
          "text": "כ-11,000 עד 6,000 שנה לפני זמננו",
          "correct": false
        },
        {
          "text": "כ-50,000 עד 20,000 שנה לפני זמננו",
          "correct": false
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 31,
      "question": "מהי התרבות הכבארית?",
      "category": "אפיפליאולית והתרבות הנטופית",
      "answers": [
        {
          "text": "תרבות מוקדמת באפיפליאולית, הכוללת תעשיות כמו ניצנית, קלחאית ונבקית",
          "correct": true
        },
        {
          "text": "תרבות פליאולית תחתונה, קודמת לאשלית",
          "correct": false
        },
        {
          "text": "התרבות המאוחרת ביותר באפיפליאולית, שבאה אחרי הנטופית",
          "correct": false
        },
        {
          "text": "תרבות ניאוליתית קרמית, מקבילה לירמוכית",
          "correct": false
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 32,
      "question": "לאיזה טווח תאריכים מתוארכת התרבות הנטופית?",
      "category": "אפיפליאולית והתרבות הנטופית",
      "answers": [
        {
          "text": "כ-15,000 עד 11,500 שנה לפני זמננו",
          "correct": true
        },
        {
          "text": "כ-50,000 עד 20,000 שנה לפני זמננו",
          "correct": false
        },
        {
          "text": "כ-11,000 עד 6,000 שנה לפני זמננו",
          "correct": false
        },
        {
          "text": "כ-6,500 עד 5,500 שנה לפני זמננו",
          "correct": false
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 33,
      "question": "אילו מהפכות מביאה איתה התרבות הנטופית, לקראת סוף האפיפליאולית?",
      "category": "אפיפליאולית והתרבות הנטופית",
      "answers": [
        {
          "text": "ראשית התיישבות הקבע, ארכיטקטורת אבן, ובתי קברות גדולים",
          "correct": true
        },
        {
          "text": "ראשית בניית ערים מבוצרות עם חומות ושערים",
          "correct": false
        },
        {
          "text": "ראשית חרושת המתכת",
          "correct": false
        },
        {
          "text": "המצאת הכתב וגלגל היוצר",
          "correct": false
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 34,
      "question": "אילו כלי אבן אופייניים לתקופה האפיפליאוליתית?",
      "category": "אפיפליאולית והתרבות הנטופית",
      "answers": [
        {
          "text": "גרזני נחושת ותכשיטי זהב",
          "correct": false
        },
        {
          "text": "אבני יד גדולות בלבד",
          "correct": false
        },
        {
          "text": "להבים, להבונים משובררים וכלי כתישה",
          "correct": true
        },
        {
          "text": "כלי חרס מעוטרים",
          "correct": false
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 35,
      "question": "איזו שיטת ציד חדשה מופיעה בתקופה האפיפליאוליתית?",
      "category": "אפיפליאולית והתרבות הנטופית",
      "answers": [
        {
          "text": "ציד באמצעות מרכבות רתומות לסוסים",
          "correct": false
        },
        {
          "text": "ציד קבוצתי בנעיצת חניתות בלבד",
          "correct": false
        },
        {
          "text": "ציד מרחוק בעזרת ירי בחץ וקשת",
          "correct": true
        },
        {
          "text": "ציד באמצעות כלבים מבויתים בלבד",
          "correct": false
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 36,
      "question": "איזה חידוש כלכלי נוסף מופיע לראשונה בתקופה האפיפליאוליתית?",
      "category": "אפיפליאולית והתרבות הנטופית",
      "answers": [
        {
          "text": "תחילת החקלאות המושקית",
          "correct": false
        },
        {
          "text": "תחילת המסחר הימי הבינלאומי",
          "correct": false
        },
        {
          "text": "תחילת כרייתת מתכות",
          "correct": false
        },
        {
          "text": "תחילת הדיג",
          "correct": true
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 37,
      "question": "איזו מערה ברצף נחל מערות מייצגת את התרבות הנטופית?",
      "category": "אפיפליאולית והתרבות הנטופית",
      "answers": [
        {
          "text": "מערת הגדי (סח'ול)",
          "correct": false
        },
        {
          "text": "מערת עמוד",
          "correct": false
        },
        {
          "text": "מערת התנור (טבון)",
          "correct": false
        },
        {
          "text": "מערת הנחל",
          "correct": true
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 38,
      "question": "מה מאפיין את שינויי מפלס הים בתקופה האפיפליאוליתית (בהקשר הגיאולוגי-אקלימי)?",
      "category": "אפיפליאולית והתרבות הנטופית",
      "answers": [
        {
          "text": "מפלס הים היה יציב לחלוטין לאורך כל התקופה",
          "correct": false
        },
        {
          "text": "מפלס הים עלה בהתמדה ולא ירד כלל",
          "correct": false
        },
        {
          "text": "שינויים גדולים במפלס הים בהתאם לתקופות קרח ותקופות בין-קרחוניות של הפלייסטוקן",
          "correct": true
        },
        {
          "text": "אין קשר בין התקופה הגיאולוגית לבין מפלס הים",
          "correct": false
        }
      ],
      "topic": "geology"
    },
    {
      "id": 138,
      "question": "איזה כלי צור מוצג בתמונה?",
      "category": "אפיפליאולית והתרבות הנטופית",
      "answers": [
        {
          "text": "להב מגל",
          "correct": true
        },
        {
          "text": "אבן יד אשלית",
          "correct": false
        },
        {
          "text": "חוד חנית ארוך",
          "correct": false
        },
        {
          "text": "גרזן נחושת",
          "correct": false
        }
      ],
      "image": {
        "url": "/quiz-images/history/artifacts/flint_sickle.jpg",
        "fit": "contain",
        "credit": "Wikimedia Commons"
      },
      "explanation": "שולב בקת עץ או עצם ושימש לקציר דגנים; ברק הסיליקה על להביו מעיד על השימוש.",
      "topic": "geology"
    },
    {
      "id": 39,
      "question": "לאיזה טווח תאריכים מתוארכת התקופה הניאוליתית באזורנו?",
      "category": "ניאולית וכלקוליתי",
      "answers": [
        {
          "text": "כ-6,500 עד 5,500 שנה לפני זמננו",
          "correct": false
        },
        {
          "text": "כ-20,000 עד 10,000 שנה לפני זמננו",
          "correct": false
        },
        {
          "text": "כ-11,000 עד 6,000 שנה לפני זמננו",
          "correct": true
        },
        {
          "text": "כ-50,000 עד 20,000 שנה לפני זמננו",
          "correct": false
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 40,
      "question": "אילו תת-תקופות כוללת התקופה הניאוליתית, לפי הסדר?",
      "category": "ניאולית וכלקוליתי",
      "answers": [
        {
          "text": "אשלית, מוסטרית ואוריניאקית",
          "correct": false
        },
        {
          "text": "ברונזה קדומה 1, 2 ו-3",
          "correct": false
        },
        {
          "text": "כלקולית קדום, תיכון ומאוחר",
          "correct": false
        },
        {
          "text": "קדם-קרמי א', קדם-קרמי ב', קדם-קרמי ג', וניאולית קרמי",
          "correct": true
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 41,
      "question": "מהו החידוש המרכזי (\"המהפכה\") של התקופה הניאוליתית?",
      "category": "ניאולית וכלקוליתי",
      "answers": [
        {
          "text": "מהפכת הכתיבה — המצאת האלפבית",
          "correct": false
        },
        {
          "text": "המהפכה העירונית — הקמת הערים הראשונות בעולם",
          "correct": false
        },
        {
          "text": "המהפכה התעשייתית — ראשית חרושת המתכת",
          "correct": false
        },
        {
          "text": "המהפכה החקלאית — ביות צמחים ובעלי חיים",
          "correct": true
        }
      ],
      "topic": "flora-fauna"
    },
    {
      "id": 42,
      "question": "אילו סוגי צמחים בויתו בתקופה הניאוליתית?",
      "category": "ניאולית וכלקוליתי",
      "answers": [
        {
          "text": "דגנים וקטניות",
          "correct": true
        },
        {
          "text": "אבטיחים ומלונים בלבד",
          "correct": false
        },
        {
          "text": "כותנה ופשתן בלבד",
          "correct": false
        },
        {
          "text": "עצי פרי ופרחי נוי בלבד",
          "correct": false
        }
      ],
      "topic": "flora-fauna"
    },
    {
      "id": 43,
      "question": "אילו בעלי חיים בויתו בתקופה הניאוליתית?",
      "category": "ניאולית וכלקוליתי",
      "answers": [
        {
          "text": "עז, כבש, חזיר ובקר",
          "correct": true
        },
        {
          "text": "כלבים וחתולים בלבד",
          "correct": false
        },
        {
          "text": "תרנגולות ואווזים בלבד",
          "correct": false
        },
        {
          "text": "סוסים וגמלים בלבד",
          "correct": false
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 44,
      "question": "באיזה שלב מופיע לראשונה כלי החרס?",
      "category": "ניאולית וכלקוליתי",
      "answers": [
        {
          "text": "בניאולית הקרמי, בתרבויות הירמוכית ויריחו IX",
          "correct": true
        },
        {
          "text": "בניאולית קדם-קרמי א', לפני ביות בעלי החיים",
          "correct": false
        },
        {
          "text": "רק בתקופת הברונזה הקדומה",
          "correct": false
        },
        {
          "text": "בפליאולית העליון, יחד עם חפצי האמנות הראשונים",
          "correct": false
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 45,
      "question": "אילו כלי אבן אופייניים לתקופה הניאוליתית?",
      "category": "ניאולית וכלקוליתי",
      "answers": [
        {
          "text": "ראשי חץ, גרזנים, להבי מגל מצור וכלי כתישה",
          "correct": true
        },
        {
          "text": "להבונים משובררים בלבד",
          "correct": false
        },
        {
          "text": "אבני יד גדולות בלבד",
          "correct": false
        },
        {
          "text": "כלי ברזל וכלי נחושת",
          "correct": false
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 46,
      "question": "מה מאפיין את אורח החיים בתקופה הניאוליתית?",
      "category": "ניאולית וכלקוליתי",
      "answers": [
        {
          "text": "אורח חיים נוודי-רועים בלעדי, ללא כל יישוב קבע",
          "correct": false
        },
        {
          "text": "נדידה מתמדת של חבורות ציידים-לקטים קטנות",
          "correct": false
        },
        {
          "text": "מגורים בכפרים חקלאיים וישיבת קבע",
          "correct": true
        },
        {
          "text": "מגורים בערים גדולות מבוצרות בלבד",
          "correct": false
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 47,
      "question": "לאיזה טווח תאריכים מתוארכת התקופה הכלקוליתית?",
      "category": "ניאולית וכלקוליתי",
      "answers": [
        {
          "text": "כ-6,500 עד 5,500 שנה לפני זמננו",
          "correct": true
        },
        {
          "text": "כ-20,000 עד 10,000 שנה לפני זמננו",
          "correct": false
        },
        {
          "text": "כ-3,500 עד 2,200 לפני הספירה",
          "correct": false
        },
        {
          "text": "כ-11,000 עד 6,000 שנה לפני זמננו",
          "correct": false
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 48,
      "question": "מהי המשמעות של ההגדרה \"פרוטו-היסטורית\" לתקופה הכלקוליתית?",
      "category": "ניאולית וכלקוליתי",
      "answers": [
        {
          "text": "תקופה שכל אירועיה מתועדים בכתב מקראי",
          "correct": false
        },
        {
          "text": "תקופה שבה כבר הומצא הכתב אך טרם נעשה בו שימוש",
          "correct": false
        },
        {
          "text": "שם נרדף לתקופה הפרהיסטורית כולה",
          "correct": false
        },
        {
          "text": "תקופת מעבר לקראת ההיסטוריה, טרם המצאת הכתב באזורנו",
          "correct": true
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 49,
      "question": "מהו החידוש הטכנולוגי המרכזי בתקופה הכלקוליתית?",
      "category": "ניאולית וכלקוליתי",
      "answers": [
        {
          "text": "תחילת חרושת המתכת — כלי נחושת",
          "correct": true
        },
        {
          "text": "תחילת ייצור כלים מברזל",
          "correct": false
        },
        {
          "text": "המצאת הגלגל וכלי הרכב",
          "correct": false
        },
        {
          "text": "המצאת הכתב האלפביתי",
          "correct": false
        }
      ],
      "explanation": "שם התקופה עצמו — כלקוליתית — מורכב מ\"נחושת\" ו\"אבן\" ביוונית. אוצר נחל משמר הוא שיאה.",
      "topic": "prehistory"
    },
    {
      "id": 50,
      "question": "מהי \"מהפכת המוצרים השניוניים\" בתקופה הכלקוליתית?",
      "category": "ניאולית וכלקוליתי",
      "answers": [
        {
          "text": "ניצול מתמשך של חיות המשק לתוצריהן (חלב, צמר) ולא רק לבשרן",
          "correct": true
        },
        {
          "text": "מעבר מייצור כלי אבן לייצור כלי מתכת בלבד",
          "correct": false
        },
        {
          "text": "תחילת ייצוא תוצרת חקלאית למצרים",
          "correct": false
        },
        {
          "text": "מעבר מגידול דגנים לגידול ירקות בלבד",
          "correct": false
        }
      ],
      "topic": "prehistory"
    },
    {
      "id": 51,
      "question": "אילו תת-תרבויות כלקוליתיות מוזכרות בחלוקת התקופה (קדום/תיכון/מאוחר)?",
      "category": "ניאולית וכלקוליתי",
      "answers": [
        {
          "text": "ירמוכית, יריחו IX וכבארית",
          "correct": false
        },
        {
          "text": "וואדי רבה, קטיפית ועסולית",
          "correct": true
        },
        {
          "text": "אשלית, מוסטרית ואוריניאקית",
          "correct": false
        },
        {
          "text": "אמורית, כנענית ופלישתית",
          "correct": false
        }
      ],
      "topic": "bible"
    },
    {
      "id": 139,
      "question": "איזה ממצא ארכיאולוגי מפורסם מוצג בתמונה?",
      "category": "ניאולית וכלקוליתי",
      "answers": [
        {
          "text": "אוצר נחל משמר",
          "correct": true
        },
        {
          "text": "אוצר תל ערד",
          "correct": false
        },
        {
          "text": "תכשיטי עקרון הפלישתית",
          "correct": false
        },
        {
          "text": "כלי בית ירח מהברונזה הקדומה",
          "correct": false
        }
      ],
      "image": {
        "url": "/quiz-images/history/artifacts/nahal_mishmar_hoard.jpg",
        "fit": "cover",
        "credit": "Wikimedia Commons"
      },
      "explanation": "יותר מ-400 חפצי נחושת כלקוליתיים שנמצאו במערה במדבר יהודה — כנראה אוצר מקדש עין גדי.",
      "topic": "bible"
    }
  ]
};

export default quiz;
