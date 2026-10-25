/** Reign/office dates are distinct from the original event dates. Durations are rounded learning aids. */
export type RomanTenure = { label: string; period: string; duration: string; note?: string; sources: string[] };
export const TENURE_SOURCES: Record<string, { title: string; href: string }> = {
  "roman": {
    "title": "המטרופוליטן — שליטי האימפריה הרומית",
    "href": "https://www.metmuseum.org/toah/hd/roru/hd_roru.htm"
  },
  "byz": {
    "title": "המטרופוליטן — שליטי ביזנטיון",
    "href": "https://www.metmuseum.org/toah/hd/byru/hd_byru.htm"
  },
  "constantine": {
    "title": "London Museum — קונסטנטינוס, 306–337",
    "href": "https://www.londonmuseum.org.uk/collections/v/object-15657/coin-nummus/"
  },
  "caracalla": {
    "title": "British Museum — קרקלה ושותפות בשלטון",
    "href": "https://www.britishmuseum.org/collection/term/BIOG140650"
  },
  "varus": {
    "title": "Livius — ורוס",
    "href": "https://www.livius.org/articles/person/quinctilius-varus/"
  },
  "quirinius": {
    "title": "Livius — קויריניוס",
    "href": "https://www.livius.org/articles/person/quirinius-p-sulpicius/"
  },
  "pilate": {
    "title": "Jewish Encyclopedia — פילטוס",
    "href": "https://jewishencyclopedia.com/articles/12147-pilate-pontius"
  },
  "cestius": {
    "title": "Oxford Classical Dictionary — קסטיוס גאלוס ופלורוס",
    "href": "https://doi.org/10.1093/acrefore/9780199381135.013.1494"
  },
  "quietus": {
    "title": "Oxford Classical Dictionary — לוסיוס קיטוס",
    "href": "https://doi.org/10.1093/acrefore/9780199381135.013.3799"
  },
  "gallus": {
    "title": "Oxford Classical Dictionary — גאלוס קיסר המשנה",
    "href": "https://doi.org/10.1093/acrefore/9780199381135.013.2787"
  },
  "herod": {
    "title": "Oxford Classical Dictionary — הורדוס הגדול",
    "href": "https://doi.org/10.1093/acrefore/9780199381135.013.3059"
  },
  "antipas": {
    "title": "Oxford Classical Dictionary — אנטיפס",
    "href": "https://doi.org/10.1093/acrefore/9780199381135.013.3060"
  },
  "agrippa": {
    "title": "British Museum — אגריפס הראשון",
    "href": "https://www.britishmuseum.org/collection/term/BIOG92391"
  },
  "nerva": {
    "title": "Oxford University Press — נרבה, 16 חודשי שלטון",
    "href": "https://blog.oup.com/2017/09/coinage-roman-emperor-nerva-ad-96-98/"
  }
};
export const ROMAN_TENURES: Record<string, RomanTenure> = {
  "augustus": {
    "label": "שנות קיסרות",
    "period": "27 לפנה״ס – 14 לספירה",
    "duration": "כ־40 שנה",
    "sources": [
      "roman"
    ],
    "note": "הספירה מתחילה בקבלת התואר אוגוסטוס ב־27 לפנה״ס; אין שנת אפס."
  },
  "tiberius": {
    "label": "שנות קיסרות",
    "period": "14–37 לספירה",
    "duration": "כ־23 שנים",
    "sources": [
      "roman"
    ]
  },
  "caligula": {
    "label": "שנות קיסרות",
    "period": "37–41 לספירה",
    "duration": "כ־4 שנים",
    "sources": [
      "roman"
    ]
  },
  "claudius": {
    "label": "שנות קיסרות",
    "period": "41–54 לספירה",
    "duration": "כ־14 שנים",
    "sources": [
      "roman"
    ]
  },
  "nero": {
    "label": "שנות קיסרות",
    "period": "54–68 לספירה",
    "duration": "כ־14 שנים",
    "sources": [
      "roman"
    ]
  },
  "vespasian": {
    "label": "שנות קיסרות",
    "period": "69–79 לספירה",
    "duration": "כ־10 שנים",
    "sources": [
      "roman"
    ],
    "note": "פיקד בארץ ב־67–69; עלה לקיסרות ב־69."
  },
  "titus": {
    "label": "שנות קיסרות",
    "period": "79–81 לספירה",
    "duration": "כ־שנתיים",
    "sources": [
      "roman"
    ],
    "note": "בחורבן ירושלים ב־70 היה מצביא; נעשה קיסר רק ב־79."
  },
  "domitian": {
    "label": "שנות קיסרות",
    "period": "81–96 לספירה",
    "duration": "כ־15 שנים",
    "sources": [
      "roman"
    ]
  },
  "nerva": {
    "label": "שנות קיסרות",
    "period": "96–98 לספירה",
    "duration": "כ־שנה וארבעה חודשים",
    "sources": [
      "roman",
      "nerva"
    ]
  },
  "trajan": {
    "label": "שנות קיסרות",
    "period": "98–117 לספירה",
    "duration": "כ־19 שנים",
    "sources": [
      "roman"
    ]
  },
  "hadrian": {
    "label": "שנות קיסרות",
    "period": "117–138 לספירה",
    "duration": "כ־21 שנים",
    "sources": [
      "roman"
    ]
  },
  "pius": {
    "label": "שנות קיסרות",
    "period": "138–161 לספירה",
    "duration": "כ־23 שנים",
    "sources": [
      "roman"
    ]
  },
  "marcus": {
    "label": "שנות קיסרות",
    "period": "161–180 לספירה",
    "duration": "כ־19 שנים",
    "sources": [
      "roman"
    ]
  },
  "severus": {
    "label": "שנות קיסרות",
    "period": "193–211 לספירה",
    "duration": "כ־18 שנים",
    "sources": [
      "roman"
    ]
  },
  "diocletian": {
    "label": "שנות קיסרות",
    "period": "284–305 לספירה",
    "duration": "כ־21 שנים",
    "sources": [
      "roman"
    ]
  },
  "maxentius": {
    "label": "שנות קיסרות",
    "period": "306–312 לספירה",
    "duration": "כ־6 שנים",
    "sources": [
      "roman"
    ]
  },
  "licinius": {
    "label": "שנות קיסרות",
    "period": "308–324 לספירה",
    "duration": "כ־16 שנים",
    "sources": [
      "roman"
    ],
    "note": "לא שלט לבדו בכל האימפריה; מ־313 שלט בעיקר במזרח."
  },
  "caracalla": {
    "label": "קיסר, כולל שלטון משותף",
    "period": "198–217 לספירה",
    "duration": "כ־19 שנים",
    "note": "שותף לאביו עד 211; לאחר מכן שלט עם גטה ולבסוף לבדו, עד 217.",
    "sources": [
      "caracalla"
    ]
  },
  "constantine": {
    "label": "קיסר, תחילה לצד שליטים אחרים",
    "period": "306–337 לספירה",
    "duration": "כ־31 שנים",
    "note": "שליט יחיד של כל האימפריה ב־324–337 — כ־13 שנים.",
    "sources": [
      "constantine"
    ]
  },
  "constantius": {
    "label": "שנות קיסרות",
    "period": "337–361 לספירה",
    "duration": "כ־24 שנים",
    "sources": [
      "byz"
    ]
  },
  "julian": {
    "label": "שנות קיסרות",
    "period": "361–363 לספירה",
    "duration": "כ־שנתיים",
    "sources": [
      "byz"
    ],
    "note": "הוכרז קיסר ב־360; הטווח כאן הוא שלטונו היחיד, לאחר מות קונסטנטיוס."
  },
  "theodosius1": {
    "label": "שנות קיסרות",
    "period": "379–395 לספירה",
    "duration": "כ־16 שנים",
    "sources": [
      "byz"
    ],
    "note": "קיסר המזרח מ־379; שלט באימפריה כולה רק בסוף ימיו."
  },
  "theodosius2": {
    "label": "קיסר המזרח",
    "period": "408–450 לספירה",
    "duration": "כ־42 שנים",
    "sources": [
      "byz"
    ],
    "note": "כבר ב־402 הוכתר לקיסר שותף; ב־408 ירש את אביו כקיסר המזרח."
  },
  "justinian": {
    "label": "שנות קיסרות",
    "period": "527–565 לספירה",
    "duration": "כ־38 שנים",
    "sources": [
      "byz"
    ]
  },
  "heraclius": {
    "label": "שנות קיסרות",
    "period": "610–641 לספירה",
    "duration": "כ־31 שנים",
    "sources": [
      "byz"
    ]
  },
  "varus": {
    "label": "מושל סוריה",
    "period": "7–4 לפנה״ס",
    "duration": "כ־3 שנים",
    "sources": [
      "varus"
    ]
  },
  "quirinius": {
    "label": "מושל סוריה",
    "period": "מינוי הקשור למפקד: 6 לספירה",
    "duration": "משך הכהונה אינו ודאי",
    "note": "אין להציג את שנת המפקד כתקופת כהונה שלמה.",
    "sources": [
      "quirinius"
    ]
  },
  "pilate": {
    "label": "נציב יהודה",
    "period": "26–36 לספירה",
    "duration": "כ־10 שנים",
    "sources": [
      "pilate"
    ]
  },
  "florus": {
    "label": "נציב יהודה",
    "period": "64–66 לספירה",
    "duration": "כ־שנתיים",
    "sources": [
      "cestius"
    ]
  },
  "cestius": {
    "label": "מושל סוריה",
    "period": "בערך 63–67 לספירה",
    "duration": "כ־4 שנים",
    "note": "המינוי מתוארך כנראה ל־63; כהונתו ודאית לכל המאוחר ב־65.",
    "sources": [
      "cestius"
    ]
  },
  "quietus": {
    "label": "מושל יהודה",
    "period": "מונה ב־117 לספירה",
    "duration": "כהונה קצרה; משכה אינו ודאי",
    "note": "הודח בידי אדריאנוס; הוצא להורג ב־118. שנת מותו אינה בהכרח סוף כהונתו.",
    "sources": [
      "quietus"
    ]
  },
  "gallus": {
    "label": "קיסר משנה במזרח",
    "period": "351–354 לספירה",
    "duration": "כ־3 שנים",
    "note": "לא היה קיסר ראשי; כיהן תחת קונסטנטיוס השני.",
    "sources": [
      "gallus"
    ]
  },
  "pompey": {
    "label": "מעמד שלטוני",
    "period": "מצביא ברפובליקה",
    "duration": "לא מלך ולא היה קיסר",
    "sources": []
  },
  "antony": {
    "label": "מעמד שלטוני",
    "period": "מצביא ושותף בשלטון הרפובליקה",
    "duration": "לא מלך ולא היה קיסר",
    "sources": []
  },
  "helena": {
    "label": "מעמד שלטוני",
    "period": "אם הקיסר קונסטנטינוס",
    "duration": "לא שלטה כקיסרית עצמאית",
    "sources": []
  },
  "eudocia": {
    "label": "מעמד שלטוני",
    "period": "רעיית הקיסר תאודוסיוס השני",
    "duration": "לא שלטה כקיסרית עצמאית",
    "sources": []
  },
  "herod-great": {
    "label": "מלכות בפועל",
    "period": "37–4 לפנה״ס",
    "duration": "כ־33 שנים",
    "note": "מונה למלך ברומא כבר ב־40 לפנה״ס; מלך בפועל מ־37.",
    "sources": [
      "herod"
    ]
  },
  "antipas": {
    "label": "טטררך בגליל ובעבר הירדן",
    "period": "4 לפנה״ס – 39 לספירה",
    "duration": "כ־42 שנים",
    "note": "טטררך, ולא מלך; המשך מקורב לפי השנים, ללא שנת אפס.",
    "sources": [
      "antipas"
    ]
  },
  "agrippa1": {
    "label": "שנות מלכות",
    "period": "37–44 לספירה",
    "duration": "כ־7 שנים",
    "note": "ביהודה ושומרון מלך רק ב־41–44 — כ־3 שנים.",
    "sources": [
      "agrippa"
    ]
  }
};
