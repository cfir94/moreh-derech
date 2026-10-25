/**
 * עיצוב החיפוש: אינדקס אחד מאחד מאגרי לימוד שונים, אך כל תוצאה שומרת את סוגה
 * ואת יעד המקור. המודול נטען דינמית רק לאחר חיפוש כדי לא להכביד על הניווט.
 */
import { CLASS_VIDEO_SECTIONS } from "@/data/class-videos";
import { EXAMS } from "@/data/exams";
import {
  ONLINE_NOTEBOOKS,
  THEORY_NOTEBOOKS,
  THEORY_SUBJECTS,
  TOUR_NOTEBOOKS,
  TOUR_REGIONS,
} from "@/data/notebooks";
import { QUIZ_DESCRIPTIONS, QUIZZES } from "@/data/quizzes";
import { FEATURED_RESOURCES, RESOURCE_GROUPS } from "@/data/resources";
import biblicalTimelines from "@/data/timelines/biblical";
import egyptCanaanTimelines from "@/data/timelines/egypt-canaan";
import secondTempleEvents from "@/data/second-temple/search.json";
import { ROMAN_EVENTS } from "@/data/roman";
import { BYZ_EVENTS } from "@/data/byzantine";
import { ARCH_TERMS } from "@/data/classical-architecture";
import { ROMAN_PEOPLE } from "@/data/roman-people";
import { PERIOD_ROWS, periodDateText } from "@/data/periods";
import { BUILDER_BY_ID, PERIOD_BY_ID, SITES as MAP_SITES } from "@/data/learning-map";
import { TOPIC_LABELS } from "@/data/topics";
import { videoGroups } from "@/data/videos";
import { listStoredNotebooks, notebookRevision, type StoredNotebook } from "@/lib/notebookStore";
import { createRequestCache } from "@/lib/requestCache";

export type SearchResultKind =
  | "notebook"
  | "video"
  | "quiz"
  | "exam"
  | "resource"
  | "timeline"
  | "tool";

export type SearchResult = {
  id: string;
  kind: SearchResultKind;
  kindLabel: string;
  title: string;
  description: string;
  href: string;
  external?: boolean;
  searchText: string;
};

const kindPriority: Record<SearchResultKind, number> = {
  notebook: 7,
  video: 6,
  quiz: 5,
  timeline: 4,
  resource: 3,
  exam: 2,
  tool: 1,
};

function normalize(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/[׳'״"]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .toLocaleLowerCase("he");
}

function staticNotebookResults(): SearchResult[] {
  const tours = TOUR_NOTEBOOKS.map((notebook) => {
    const region = TOUR_REGIONS.find((entry) => entry.id === notebook.region)?.title ?? notebook.region;
    return {
      id: `notebook-${notebook.id}`,
      kind: "notebook" as const,
      kindLabel: "מחברת סיור",
      title: notebook.title,
      description: `${region} · ${notebook.date} · ${notebook.guide}`,
      href: notebook.url,
      external: true,
      searchText: [notebook.title, notebook.places, notebook.guide, notebook.date, region].join(" "),
    };
  });
  const theory = THEORY_NOTEBOOKS.map((notebook) => {
    const subject = THEORY_SUBJECTS.find((entry) => entry.id === notebook.subject)?.title ?? notebook.subject;
    return {
      id: `notebook-${notebook.id}`,
      kind: "notebook" as const,
      kindLabel: "מחברת עיונית",
      title: notebook.title,
      description: `${subject} · ${notebook.date} · ${notebook.guide}`,
      href: notebook.url,
      external: true,
      searchText: [notebook.title, notebook.focus, notebook.guide, notebook.date, subject].join(" "),
    };
  });
  const online = ONLINE_NOTEBOOKS.map((notebook) => ({
    id: `notebook-${notebook.id}`,
    kind: "notebook" as const,
    kindLabel: "מחברת מקוונת",
    title: notebook.title,
    description: [notebook.focus, notebook.lecturer].filter(Boolean).join(" · "),
    href: notebook.url,
    external: true,
    searchText: [notebook.title, notebook.focus, notebook.lecturer, notebook.date].filter(Boolean).join(" "),
  }));
  return [...tours, ...theory, ...online];
}

function storedNotebookResults(notebooks: StoredNotebook[]): SearchResult[] {
  const modeLabels = { tours: "מחברת סיור", theory: "מחברת עיונית", online: "מחברת מקוונת" };
  return notebooks.map((notebook) => ({
    id: `stored-notebook-${notebook.id}`,
    kind: "notebook",
    kindLabel: modeLabels[notebook.mode],
    title: notebook.title,
    description: [notebook.subcategory, notebook.date, notebook.guide].filter(Boolean).join(" · "),
    href: notebook.url,
    external: true,
    searchText: [notebook.title, notebook.subcategory, notebook.places, notebook.guide, notebook.date].join(" "),
  }));
}

function videoResults(): SearchResult[] {
  const sections = [
    ...CLASS_VIDEO_SECTIONS,
    {
      id: "enrichment" as const,
      title: "העשרה",
      description: "חומרי העשרה",
      groups: videoGroups,
    },
  ];
  return sections.flatMap((section) =>
    section.groups.flatMap((group) =>
      group.items.map((item) => ({
        id: `video-${item.id}`,
        kind: "video" as const,
        kindLabel: section.id === "tours" ? "סרטוני סיור" : section.id === "online" ? "קורס מקוון" : section.id === "theory" ? "שיעור עיוני" : "סרטון העשרה",
        title: item.title,
        description: `${group.category} · ${item.description}`,
        href: `/videos/?video=${encodeURIComponent(item.id)}`,
        searchText: [section.title, group.category, group.intro, item.title, item.description, item.source, item.subtopic?.title, ...(item.keywords ?? [])].filter(Boolean).join(" "),
      })),
    ),
  );
}

function resourceResults(): SearchResult[] {
  const featured = FEATURED_RESOURCES.map((resource) => ({
    id: `resource-featured-${resource.slug}`,
    kind: "resource" as const,
    kindLabel: "חומר לימוד",
    title: resource.title,
    description: resource.note ?? "מקור לימוד חיצוני.",
    href: resource.url,
    external: true,
    searchText: [resource.title, resource.note].filter(Boolean).join(" "),
  }));
  const groups = RESOURCE_GROUPS.flatMap((group) =>
    group.items.map((resource, index) => ({
      id: `resource-${group.slug}-${index}`,
      kind: "resource" as const,
      kindLabel: "סיכום",
      title: resource.title,
      description: `${group.title} · ${group.description}`,
      href: resource.url,
      external: true,
      searchText: [resource.title, group.title, group.description].join(" "),
    })),
  );
  return [...featured, ...groups];
}

function timelineResults(): SearchResult[] {
  const collections = [
    { href: "/timelines/egypt-canaan", timelines: egyptCanaanTimelines },
    { href: "/timelines/biblical", timelines: biblicalTimelines },
  ];
  return collections.flatMap(({ href, timelines }) =>
    timelines.flatMap((timeline) =>
      timeline.events.map((event) => ({
        id: `timeline-${timeline.id}-${event.id}`,
        kind: "timeline" as const,
        kindLabel: "ציר זמן",
        title: event.title,
        description: `${timeline.title} · ${event.reference}`,
        href: `${href}#${event.id}`,
        searchText: [timeline.title, timeline.subtitle, event.title, event.reference, event.body, event.takeaway, event.quote].filter(Boolean).join(" "),
      })),
    ),
  );
}

const toolResults: SearchResult[] = [
  { id: "tool-who-am-i", kind: "tool", kindLabel: "משחק", title: "מי אני? — קולות מן העבר", description: "195 דמויות מההיסטוריה, היהדות והנצרות, רמזים בגוף ראשון, שאלות אמריקאיות והקלדה, תמונות והסברים.", href: "/games/who-am-i", searchText: "מי אני דמויות היסטוריות משחק זיהוי מלכים קיסרים נביאים חכמים בית ראשון בית שני רומא ביזנטיון ברזל שופטים טיטוס הורדוס יהדות נצרות מקרא חכמים רמבם רשי ישוע מרים שליחים" },
  { id: "tool-map", kind: "tool", kindLabel: "כלי", title: "מפה", description: "מפת למידה של אתרי בית שני, הרומית והביזנטית, ומפת שטח לתכנון מסלול.", href: "/map", searchText: "מפה מפות אתרים מקומות" },
  { id: "tool-learning-map", kind: "tool", kindLabel: "כלי", title: "מפת למידה — אתרי בית שני, רומית וביזנטית", description: "מי בנה ומתי, מה רואים באתר, תמונות, טיפים לזכירה ותרגול בסגנון המבחן.", href: "/map/learn", searchText: "מפת למידה מפה אתרים בונים הורדוס קונסטנטינוס הלנה יוסטיניאנוס אבדוקיה חשמונאים כנסיות מנזרים בתי כנסת מבצרים תרגול זיהוי" },
  { id: "tool-route-map", kind: "tool", kindLabel: "כלי", title: "מפת השטח — תכנון מסלול", description: "מפת אתרים, מסלולים ונקודות עניין בארץ, עובדת גם בלי רשת.", href: "/map/route", searchText: "מפה מפת שטח מסלול תכנון אתרים מקומות נקודות עניין גאוגרפיה שטח אופליין" },
  { id: "tool-guide-reports", kind: "tool", kindLabel: "כלי", title: "דוחות הדרכה", description: "למידה, תרגול ודוגמאות להכנת דוחות סיור.", href: "/guide-reports", searchText: "דוחות הדרכה סיור אתרים תרגול בחינה מסלול" },
  { id: "tool-timeline-drag", kind: "tool", kindLabel: "תרגול", title: "תרגול סדר כרונולוגי", description: "משחק גרירה לתרגול תקופות ואירועים על ציר הזמן.", href: "/quizzes/timeline-drag", searchText: "ציר זמן סדר כרונולוגי תקופות היסטוריה תרגול" },
  { id: "tool-games", kind: "tool", kindLabel: "משחק", title: "משחקי לימוד", description: "משחקי דמויות היסטוריות, גאוגרפיה, כנסיות וצמחי ארץ ישראל.", href: "/games", searchText: "משחקים גאוגרפיה כנסיות נצרות צמחים צומח" },
];

function learningMapResults(): SearchResult[] {
  return MAP_SITES.map((site) => ({
    id: `learning-map-${site.id}`,
    kind: "tool" as const,
    kindLabel: "מפת למידה",
    title: site.name,
    description: `${site.place} · ${[...new Set(site.layers.map((l) => PERIOD_BY_ID[l.period].title))].join(", ")}`,
    href: `/map/learn/#${site.id}`,
    searchText: [
      site.name, site.place,
      ...site.layers.map((l) => `${l.title} ${l.builder ? BUILDER_BY_ID[l.builder].name : ""}`),
      ...(site.finds ?? []).map((f) => f.title),
    ].join(" "),
  }));
}

const baseResults: SearchResult[] = [
  ...staticNotebookResults(),
  ...videoResults(),
  ...resourceResults(),
  ...timelineResults(),
  ...learningMapResults(),
  {
    id: "timeline-history-atlas",
    kind: "tool",kindLabel:"אטלס אינטראקטיבי",title:"אטלס הזמן — בית שני: דמויות ואירועים",description:"מתקרבים ומתרחקים בזמן: מבט על, הקשר ופירוט מלא, עם דמויות, אירועים וקשרים.",href:"/timelines/history-atlas",searchText:"אטלס ציר זמן בית שני דמויות אירועים זום התקרבות התרחקות היסטוריה חשמונאים הורדוס כורש"
  },
  {
    id: "timeline-roman-people",
    kind: "timeline",
    kindLabel: "כלי זיכרון",
    title: "מי זה מי ברומא? — דמויות ותפקידים",
    description: "36 דמויות רומיות וביזנטיות, השוואות בין שמות מבלבלים ותרגול בכרטיסי זיכרון.",
    href: "/timelines/roman-people",
    searchText: ["קיסרים מצביאים נציבים זיכרון רומא ביזנטיון השוואה דמויות", ...ROMAN_PEOPLE.map(person => `${person.name} ${person.aliases} ${person.hook}`)].join(" "),
  },
  {
    id: "timeline-history-talk",
    kind: "timeline",
    kindLabel: "שיחה קולית",
    title: "דבר עם ההיסטוריה — 12 דמויות ומורה דרך שבוחן אותך",
    description: "שואלים בקול, בעברית, והדמות עונה מתוך המקורות. מוטי, מורה הדרך הוותיק, משוחח על כל חומר הקורס ובוחן אותך.",
    href: "/timelines/history-talk",
    searchText:
      "דבר עם ההיסטוריה שיחה קולית דמויות חזקיהו נקבת השילוח סנחריב נחמיה חומות ירושלים יהודה המכבי חשמונאים חנוכה הורדוס קיסריה הרודיון יוסף בן מתתיהו יוספוס טיטוס מרד גדול חורבן בית שני רבן יוחנן בן זכאי יבנה רבי עקיבא בר כוכבא רבי יהודה הנשיא משנה ציפורי בית שערים הלנה כנסיית הקבר הירונימוס בית לחם וולגטה יוסטיניאנוס הנאה סנטה קתרינה מוטי מורה דרך ותיק בוחן מבחן בעל פה תרגול קולי שאלות",
  },
  {
    id: "timeline-periods",
    kind: "timeline",
    kindLabel: "טבלת תקופות",
    title: "טבלת התקופות — מבט משווה",
    description: "שלטונות, אירועים ושנים מהמקרא עד הכיבוש המוסלמי, לצד תקופות היצירה היהודית.",
    href: "/timelines/periods",
    searchText: ["טבלת התקופות השוואה כרונולוגיה שלטון מקרא משנה תלמוד תנאים אמוראים סבוראים גאונים", ...PERIOD_ROWS.map(row => `${row.event} ${periodDateText(row)}`)].join(" "),
  },
  {
    id: "timeline-second-temple",
    kind: "timeline",
    kindLabel: "ציר זמן",
    title: "בית שני — מן השיבה אל החורבן",
    description: "שיבת ציון, חשמונאים, הורדוס והמרד הגדול; דמויות, אתרים ומקורות.",
    href: "/timelines/second-temple",
    searchText: "בית שני הבית השני שיבת ציון חשמונאים הורדוס נציבים המרד הגדול חורבן",
  },
  ...secondTempleEvents.map((event) => ({
    id: `timeline-second-temple-${event.id}`,
    kind: "timeline" as const,
    kindLabel: "ציר זמן",
    title: event.title,
    description: `בית שני · ${event.date} · ${event.summary}`,
    href: `/timelines/second-temple/#${event.id}`,
    searchText: ["בית שני", event.title, event.date, event.summary, event.people, event.places].join(" "),
  })),
  {
    id: "timeline-roman",
    kind: "timeline",
    kindLabel: "ציר זמן",
    title: "התקופה הרומית — מפומפיוס עד קונסטנטינוס",
    description: "63 לפנה״ס – 324 לספירה: החורבן, יבנה, בר כוכבא, המשנה, קיסרים, לגיונות ואתרים.",
    href: "/timelines/roman",
    searchText: "התקופה הרומית רומא רומאים קיסרים לגיון אדריאנוס בר כוכבא איליה קפיטולינה משנה דיוקלטיאנוס",
  },
  ...ROMAN_EVENTS.map((event) => ({
    id: `timeline-roman-${event.id}`,
    kind: "timeline" as const,
    kindLabel: "ציר זמן",
    title: event.title,
    description: `התקופה הרומית · ${event.date} · ${event.summary}`,
    href: `/timelines/roman/#${event.id}`,
    searchText: ["התקופה הרומית", event.title, event.date, event.summary, event.sites ?? ""].join(" "),
  })),
  {
    id: "timeline-byzantine",
    kind: "timeline",
    kindLabel: "ציר זמן",
    title: "התקופה הביזנטית — ארץ הקודש",
    description: "324–638: כנסיות, מנזרים, צליינים, מפת מידבא, התלמוד הירושלמי, בתי כנסת והכיבוש המוסלמי.",
    href: "/timelines/byzantine",
    searchText: "התקופה הביזנטית ביזנטים קונסטנטינוס יוסטיניאנוס כנסיות מנזרים צליינים מפת מידבא תלמוד ירושלמי",
  },
  ...BYZ_EVENTS.map((event) => ({
    id: `timeline-byzantine-${event.id}`,
    kind: "timeline" as const,
    kindLabel: "ציר זמן",
    title: event.title,
    description: `התקופה הביזנטית · ${event.date} · ${event.summary}`,
    href: `/timelines/byzantine/#${event.id}`,
    searchText: ["התקופה הביזנטית", event.title, event.date, event.summary, event.sites ?? ""].join(" "),
  })),
  {
    id: "timeline-classical-architecture",
    kind: "timeline",
    kindLabel: "שרטוטים",
    title: "מושגי יסוד באדריכלות קלאסית",
    description: "שרטוטים אינטראקטיביים: סדרים, מקדשים, תכנון עיר, אמות מים, מבני בידור, מרחץ, מקוואות, קבורה, בתי כנסת וכנסיות.",
    href: "/timelines/classical-architecture",
    searchText: "אדריכלות קלאסית ארכיטקטורה סדרים דורי יוני קורינתי עמוד כותרת מקדש קרדו דקומנוס תיאטרון היפודרום אמפיתיאטרון מרחץ אמת מים מקווה קבורה גלוסקמה בית כנסת בסיליקה",
  },
  ...ARCH_TERMS.map((term) => ({
    id: `timeline-classical-architecture-${term.id}`,
    kind: "timeline" as const,
    kindLabel: "מושג באדריכלות",
    title: term.term,
    description: term.text,
    href: `/timelines/classical-architecture/#t-${term.id}`,
    searchText: ["אדריכלות קלאסית", term.term, term.latin ?? "", term.text, term.site ?? ""].join(" "),
  })),
  ...toolResults,
];

const storedNotebookCache = createRequestCache(listStoredNotebooks, 60_000);

function getStoredNotebooks() {
  return storedNotebookCache.get(notebookRevision()).catch(() => []);
}

function includesAllTokens(value: string, tokens: string[]) {
  const normalizedValue = normalize(value);
  return tokens.every((token) => normalizedValue.includes(token));
}

function quizResults(queryTokens: string[]): SearchResult[] {
  return QUIZZES.flatMap((quiz) => {
    const matchingQuestions = quiz.questions.filter((question) =>
      includesAllTokens(
        [question.question, question.category, question.topic ? TOPIC_LABELS[question.topic] : "", question.explanation, ...question.answers.map((answer) => answer.text)].filter(Boolean).join(" "),
        queryTokens,
      ),
    );
    const headingMatches = includesAllTokens([quiz.label, QUIZ_DESCRIPTIONS[quiz.slug], ...quiz.categories].filter(Boolean).join(" "), queryTokens);
    if (!headingMatches && matchingQuestions.length === 0) return [];
    const sample = matchingQuestions.slice(0, 2).map((question) => question.question).join(" · ");
    return [{
      id: `quiz-${quiz.slug}`,
      kind: "quiz" as const,
      kindLabel: "שאלון",
      title: quiz.label,
      description: matchingQuestions.length ? `${matchingQuestions.length} שאלות קשורות · ${sample}` : QUIZ_DESCRIPTIONS[quiz.slug],
      href: `/quizzes/${quiz.slug}`,
      searchText: [quiz.label, QUIZ_DESCRIPTIONS[quiz.slug], sample].filter(Boolean).join(" "),
    }];
  });
}

function examResults(queryTokens: string[]): SearchResult[] {
  return EXAMS.flatMap((exam) => {
    const matchingQuestions = exam.questions.filter((question) =>
      includesAllTokens(
        [question.statement.he, question.statementAnswer.he, question.question.he, question.topic ? TOPIC_LABELS[question.topic] : "", ...question.answers.map((answer) => answer.text.he)].filter(Boolean).join(" "),
        queryTokens,
      ),
    );
    const headingMatches = includesAllTokens([exam.label.he, exam.subjects, exam.family, exam.date].filter(Boolean).join(" "), queryTokens);
    if (!headingMatches && matchingQuestions.length === 0) return [];
    return [{
      id: `exam-${exam.slug}`,
      kind: "exam" as const,
      kindLabel: "מבחן מלא",
      title: exam.label.he,
      description: matchingQuestions.length ? `${matchingQuestions.length} שאלות קשורות במבחן זה` : [exam.subjects, exam.date].filter(Boolean).join(" · "),
      href: `/exams/${exam.slug}`,
      searchText: [exam.label.he, exam.subjects, exam.family, exam.date].filter(Boolean).join(" "),
    }];
  });
}

function scoreResult(result: SearchResult, normalizedQuery: string, tokens: string[]) {
  const title = normalize(result.title);
  const description = normalize(result.description);
  const haystack = normalize(`${result.searchText} ${result.kindLabel}`);
  if (!tokens.every((token) => haystack.includes(token))) return 0;
  let score = kindPriority[result.kind] * 2;
  if (title === normalizedQuery) score += 120;
  else if (title.includes(normalizedQuery)) score += 75;
  else if (description.includes(normalizedQuery)) score += 40;
  score += tokens.reduce((total, token) => total + (title.includes(token) ? 18 : description.includes(token) ? 9 : 3), 0);
  return score;
}

export async function searchSite(query: string): Promise<SearchResult[]> {
  const normalizedQuery = normalize(query);
  if (normalizedQuery.length < 2) return [];
  const tokens = normalizedQuery.split(" ").filter(Boolean);
  const storedNotebooks = await getStoredNotebooks();
  const candidates = [
    ...baseResults,
    ...storedNotebookResults(storedNotebooks),
    ...quizResults(tokens),
    ...examResults(tokens),
  ];

  return candidates
    .map((result) => ({ result, score: scoreResult(result, normalizedQuery, tokens) }))
    .filter(({ score }) => score > 0)
    .sort((first, second) => second.score - first.score || first.result.title.localeCompare(second.result.title, "he"))
    .slice(0, 40)
    .map(({ result }) => result);
}
