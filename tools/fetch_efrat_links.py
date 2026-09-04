"""
Refresh the study-resource directory from Efrat Nakash's tour-guide page.

Efrat Nakash is a licensed guide who publishes, for free, the fullest Hebrew
set of course materials there is: a summary per syllabus topic, tour reports
per site, model route plans for part B of the exam, presentations and maps.

Her site says "כל הזכויות שמורות — אין להעתיק ללא הרשאה בכתב", so **nothing is
copied**: this writes a directory of links with her name on it, and every link
opens her own page. Bringing any of her text into the site itself needs her
written permission first.

Usage:  python3 tools/fetch_efrat_links.py
"""

import html
import re
import sys
import urllib.request
from pathlib import Path

PAGE = "https://www.efratnakash.com/touring-israel-tips-h.asp"
SITE = "https://www.efratnakash.com"
OUT = Path(__file__).resolve().parent.parent / "src/data/resources.ts"

# The page marks its sub-headings with plain bold text rather than headings, so
# the grouping lives here, keyed by the link's own title.
GROUPS = [
    (
        "history",
        "היסטוריה וארכאולוגיה",
        "סיכומי הרצאות לפי תקופה — מהפרהיסטוריה ועד ימינו.",
        [
            "פרהיסטוריה בארץ ישראל",
            "תקופת הבית הראשון וארכאולוגיה של התקופות הקדומות",
            "תקופת הבית השני",
            "התקופה הרומית-ביזנטית, ארכאולוגיה קלאסית ויהודית",
            "התקופה הערבית הקדומה",
            "התקופה הצלבנית",
            "התקופה המוסלמית-ערבית השנייה",
            "העת החדשה",
            "תולדות השואה",
            "מלחמות ישראל",
            "מדינת ישראל מהקמתה ועד היום",
            "ירושלים לדורותיה",
        ],
    ),
    (
        "geography",
        "גאוגרפיה",
        "גבולות, דרכים, גאולוגיה, אקלים והחי והצומח של הארץ.",
        [
            "מבוא לארץ ישראל – גבולות",
            "מבוא לארץ ישראל – דרכים",
            "גאולוגיה וגאומורפולוגיה",
            "האקלים בארץ ישראל",
            "הצומח בארץ ישראל",
            "החי בארץ ישראל",
            "מושגי יסוד בטופוגרפיה",
        ],
    ),
    (
        "religions",
        "דתות ומיעוטים",
        "שלוש הדתות והעדות שחיות בארץ.",
        ["אסלאם", "יהדות", "נצרות", "מיעוטים ופולקלור במדינת ישראל"],
    ),
    (
        "art",
        "אמנות ואדריכלות",
        "סגנונות בנייה לפי תקופה ולפי דת — מה רואים באתר ואיך מזהים.",
        [
            "סגנונות אדריכליים ואמנותיים",
            "אמנות ואדריכלות מוסלמית",
            "אמנות ואדריכלות נוצרית",
            "אדריכלות בתקופות ההלניסטית, רומית וביזנטית",
            "אדריכלות בתקופה הצלבנית",
        ],
    ),
    (
        "israel-today",
        "ישראל של היום",
        "משטר, כלכלה, מים, סביבה והסכסוך — הנושאים ה“לא-היסטוריים” של הבחינה.",
        [
            "תולדות הסכסוך הישראלי-ערבי",
            "המשטר בישראל",
            "הידרולוגיה ומשאבי המים של ישראל",
            "הכלכלה בישראל",
            "שמירת טבע, איכות הסביבה ותיירות אקולוגית",
            'ביקורי תיירים ב"שטחים"',
        ],
    ),
    (
        "profession",
        "המקצוע עצמו",
        "מה שנבחן בחלק ההדרכה: מתודיקה, בטיחות, חוק, עמידה מול קהל.",
        [
            "היבטים משפטיים של המקצוע",
            "הסברה של מדינת ישראל",
            "תיירות בישראל",
            "תיירות נגישה לאנשים עם מוגבלות",
            "בטחון ובטיחות בטיולים",
            "מתודיקה של הדרכה",
            "תדמית ועמידה בפני קהל",
            "מיומנויות למידה וזכירה, הכנה למבחן הרישוי",
            "מקורות מידע",
        ],
    ),
    (
        "maps",
        "מצגות ומפות",
        "מפות Google ייעודיות ומצגות לנושאים שקשה לתפוס בלי לראות.",
        [
            "מצגת חומות ירושלים",
            "מצגת חומות עכו",
            "מצגת ארץ ישראל - פלשתינה במאות 20 ו-21",
            "מפת בתי כנסת קדומים",
            'מפת הדרכים לירושלים בתש"ח',
            "מפת מבצרים צלבניים",
            "מפת אתרי ביקור לצליינים נוצרים",
            "מפת הוויה דולורוזה",
            "מפת אתרי מורשת עולמית",
        ],
    ),
]

# Links that are the point of a whole section of our own site, and are worth
# naming in full rather than by their title on her page.
# (slug, title we show, note, and either the URL itself or the start of the
# link's text on her page)
FEATURED = [
    (
        "reports",
        "דוחות סיור לפי אתר",
        "דוח סיור לכל אתר וקטע דרך, מסודר לפי אזור — הבסיס לדוחות שכותבים בקורס.",
        f"{SITE}/touring-israel-tips/list-of-tours-and-sites.asp",
    ),
    (
        "four-lines",
        "טבלת תמצית תכני הדרכה ב-4 שורות",
        "לכל אתר: ארבע שורות שאפשר להגיד עליו. בדיוק מה שנדרש בחלק ב' של המבחן בכתב.",
        "טבלת תמצית תכני הדרכה",
    ),
    (
        "routes",
        "מסלולי טיול — פתרונות חלק ב'",
        "כ-20 מסלולים בנויים לפי נושא, כתשובה לדוגמה לשאלת בניית המסלול.",
        f"{SITE}/touring-israel-tips/list-of-tour-plans.asp",
    ),
    (
        "questions",
        "שאלות על נושאי הלימוד ופתרונן",
        "רשימת שאלות לחזרה עם התשובות, וקישורים לחידונים.",
        "רשימת שאלות על נושאי הלימוד",
    ),
]

HEADER = """// Auto-generated by tools/fetch_efrat_links.py — do not edit by hand.
//
// A directory of links to Efrat Nakash's public course materials. Her site
// reserves all rights, so the site links to her pages and never copies them.
import type { ResourceGroup, Resource } from "@/data/resources-types";

"""


def fetch_links():
    req = urllib.request.Request(PAGE, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        page = r.read().decode("windows-1255", "replace")

    links = {}
    for href, text in re.findall(
        r'<a[^>]+href="(https?://[^"]+)"[^>]*>(.*?)</a>', page, re.S | re.I
    ):
        title = html.unescape(re.sub(r"<[^>]+>", "", text)).strip()
        if title and title not in links:
            links[title] = href
    return links


def ts(value):
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def main():
    links = fetch_links()

    def resolve(target):
        """A URL passes through; anything else is a prefix of a link's text."""
        if target.startswith("http"):
            return target
        return next((u for t, u in links.items() if t.startswith(target)), None)

    missing = [t for _, _, _, titles in GROUPS for t in titles if t not in links] + [
        target for _, _, _, target in FEATURED if not resolve(target)
    ]
    if missing:
        print(f"not found on the page: {missing}", file=sys.stderr)

    out = [HEADER]

    featured = []
    for slug, title, note, target in FEATURED:
        href = resolve(target)
        if not href:
            continue
        featured.append(
            f"  {{ slug: {ts(slug)}, title: {ts(title)}, note: {ts(note)},"
            f" url: {ts(href)} }},"
        )
    out.append(
        "/** The lists that answer a whole section of this site directly. */\n"
        "export const FEATURED_RESOURCES: Resource[] = [\n"
        + "\n".join(featured)
        + "\n];\n"
    )

    groups = []
    for slug, title, description, titles in GROUPS:
        items = [
            f"      {{ title: {ts(t)}, url: {ts(links[t])} }},"
            for t in titles
            if t in links
        ]
        groups.append(
            f"  {{\n    slug: {ts(slug)},\n    title: {ts(title)},\n"
            f"    description: {ts(description)},\n    items: [\n"
            + "\n".join(items)
            + "\n    ],\n  },"
        )
    out.append(
        "export const RESOURCE_GROUPS: ResourceGroup[] = [\n"
        + "\n".join(groups)
        + "\n];\n"
    )

    OUT.write_text("\n".join(out))
    total = sum(len(t) for _, _, _, t in GROUPS)
    print(f"{total} links in {len(GROUPS)} groups -> {OUT.name}", file=sys.stderr)


if __name__ == "__main__":
    main()
