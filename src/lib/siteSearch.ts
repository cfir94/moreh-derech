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
import { TOPIC_LABELS } from "@/data/topics";
import { videoGroups } from "@/data/videos";
import { listStoredNotebooks, type StoredNotebook } from "@/lib/notebookStore";

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
  { id: "tool-map", kind: "tool", kindLabel: "כלי", title: "מפת השטח", description: "מפת אתרים, מסלולים ונקודות עניין בארץ.", href: "/map", searchText: "מפה אתרים מקומות מסלולים נקודות עניין גאוגרפיה שטח" },
  { id: "tool-guide-reports", kind: "tool", kindLabel: "כלי", title: "דוחות הדרכה", description: "למידה, תרגול ודוגמאות להכנת דוחות סיור.", href: "/guide-reports", searchText: "דוחות הדרכה סיור אתרים תרגול בחינה מסלול" },
  { id: "tool-timeline-drag", kind: "tool", kindLabel: "תרגול", title: "תרגול סדר כרונולוגי", description: "משחק גרירה לתרגול תקופות ואירועים על ציר הזמן.", href: "/quizzes/timeline-drag", searchText: "ציר זמן סדר כרונולוגי תקופות היסטוריה תרגול" },
  { id: "tool-games", kind: "tool", kindLabel: "משחק", title: "משחקי לימוד", description: "משחקי גאוגרפיה, כנסיות וצמחי ארץ ישראל.", href: "/games", searchText: "משחקים גאוגרפיה כנסיות נצרות צמחים צומח" },
];

const baseResults: SearchResult[] = [
  ...staticNotebookResults(),
  ...videoResults(),
  ...resourceResults(),
  ...timelineResults(),
  ...toolResults,
];

let storedNotebookPromise: Promise<StoredNotebook[]> | null = null;

function getStoredNotebooks() {
  storedNotebookPromise ??= listStoredNotebooks().catch(() => []);
  return storedNotebookPromise;
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
