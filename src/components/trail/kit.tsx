/*
 * ערכת הרכיבים של "תרמיל מורה הדרך" (docs/design/REDESIGN.md, סעיף 2.2).
 * כל רכיב הוא חפץ מהשטח: שלט חום לפעולה ראשית, דף נייר לתוכן, צ'יפ מקווקו לסינון, חותמת לתגית,
 * סימוני שביל להתקדמות, ועיגול עט של מורה לתשובה נכונה. הצבעים רק מטוקנים, כך ששני המצבים עובדים.
 */
import Link from "next/link";
import type { ComponentProps, ReactNode, SVGProps } from "react";
import { InkIcon } from "./Ink";
import type { FieldIconName } from "./FieldIcons";
import k from "./kit.module.css";

export { k as kit };

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/** The page column, with an optional narrow measure for reading screens. */
export function TrailPage({ narrow, className, children }: { narrow?: boolean; className?: string; children: ReactNode }) {
  return <div className={cx(k.page, narrow && k.narrow, className)}>{children}</div>;
}

/** A hand-drawn green stroke under a title. */
export function PenUnderline({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={cx(k.underline, className)} viewBox="0 0 300 14" preserveAspectRatio="none">
      <path d="M4 9c40-5 90-7 140-5s100 4 152-2" />
    </svg>
  );
}

/**
 * The head of a page: breadcrumbs in pencil, the title in the guide's hand with a pen stroke under it,
 * one sentence, and room for a single drawing that belongs to the page.
 */
export function PageHead({
  title,
  lede,
  crumbs,
  art,
  children,
}: {
  title: string;
  lede?: ReactNode;
  crumbs?: { href: string; label: string }[];
  /** one drawing that belongs to this page's subject, e.g. <InkIcon name="exams" /> */
  art?: ReactNode;
  children?: ReactNode;
}) {
  const long = title.length > 26;
  return (
    <header className={k.head}>
      {crumbs && crumbs.length > 0 && (
        <nav aria-label="פירורי לחם">
          <ol className={cx(k.crumbs, "pencil")}>
            {crumbs.map((c) => (
              <li key={c.href}>
                <Link href={c.href}>{c.label}</Link>
              </li>
            ))}
          </ol>
        </nav>
      )}
      <h1 className={cx(k.title, long && k.titleLong)}>{title}</h1>
      <PenUnderline />
      {lede && <p className={k.lede}>{lede}</p>}
      {children}
      {art && (
        <span aria-hidden className={k.headArt}>
          {art}
        </span>
      )}
    </header>
  );
}

/** A section title in the guide's hand, with a note in pencil under it. */
export function SectionHead({ id, title, note }: { id?: string; title: string; note?: ReactNode }) {
  return (
    <>
      <h2 id={id} className={k.sectionTitle}>
        {title}
      </h2>
      {note && <p className={k.sectionNote}>{note}</p>}
    </>
  );
}

type SignBody = {
  title: ReactNode;
  sub?: ReactNode;
  icon?: FieldIconName;
  small?: boolean;
  wide?: boolean;
  className?: string;
};

function SignInner({ title, sub, icon, small }: SignBody) {
  return (
    <>
      {icon && <InkIcon name={icon} size={small ? 24 : 34} className={k.signIcon} />}
      <span className={k.signText}>
        <span className={k.signTitle}>{title}</span>
        {sub && <span className={k.signSub}>{sub}</span>}
      </span>
    </>
  );
}

/** The brown sign: the main action on a screen. As a link. */
export function SignLink({ href, ...body }: SignBody & { href: string }) {
  return (
    <Link href={href} className={cx(k.sign, body.small && k.signSmall, body.wide && k.signWide, body.className)}>
      <SignInner {...body} />
    </Link>
  );
}

/** The brown sign as a button. */
export function SignButton({
  title,
  sub,
  icon,
  small,
  wide,
  className,
  ...rest
}: SignBody & Omit<ComponentProps<"button">, "title">) {
  return (
    <button type="button" {...rest} className={cx(k.sign, small && k.signSmall, wide && k.signWide, className)}>
      <SignInner title={title} sub={sub} icon={icon} small={small} />
    </button>
  );
}

/** A sheet of paper. `tilt` gives it the slight hand-placed angle; long reading stays straight. */
export function Paper({
  as: Tag = "div",
  tilt,
  alt,
  tape,
  ruled,
  className,
  children,
  ...rest
}: {
  as?: "div" | "section" | "article" | "li";
  tilt?: boolean;
  /** tilt the other way, for alternating rows */
  alt?: boolean;
  tape?: boolean;
  ruled?: boolean;
  className?: string;
  children: ReactNode;
} & Record<string, unknown>) {
  return (
    <Tag
      {...rest}
      className={cx(k.paper, tilt && k.tilt, tilt && alt && k.tiltAlt, tape && k.tape, ruled && k.ruled, className)}
    >
      {children}
    </Tag>
  );
}

/** A sheet of paper that is a link: it lifts and straightens under the hand. */
export function PaperLink({
  href,
  tilt = true,
  alt,
  tape,
  className,
  children,
  ...rest
}: { href: string; tilt?: boolean; alt?: boolean; tape?: boolean; className?: string; children: ReactNode } & Omit<
  ComponentProps<typeof Link>,
  "href" | "className" | "children"
>) {
  return (
    <Link
      href={href}
      {...rest}
      className={cx(k.paper, k.paperLink, tilt && k.tilt, tilt && alt && k.tiltAlt, tape && k.tape, className)}
    >
      {children}
    </Link>
  );
}

/** A dashed pill, for filters and secondary links. */
export function Chip({
  href,
  on,
  icon,
  className,
  children,
  ...rest
}: { href?: string; on?: boolean; icon?: FieldIconName; className?: string; children: ReactNode } & Omit<
  ComponentProps<"button">,
  "className" | "children"
>) {
  const cls = cx(k.chip, on && k.chipOn, className);
  const inner = (
    <>
      {icon && <InkIcon name={icon} size={22} />}
      {children}
    </>
  );
  if (href)
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  return (
    <button type="button" aria-pressed={on} {...rest} className={cls}>
      {inner}
    </button>
  );
}

/** An inked rubber stamp for tags: "רשמי", "חדש", "השלמה", "לחזרה". */
export function Stamp({ tone = "brown", className, children }: { tone?: "red" | "blue" | "green" | "brown"; className?: string; children: ReactNode }) {
  const t = { red: k.stampRed, blue: k.stampBlue, green: k.stampGreen, brown: k.stampBrown }[tone];
  return <span className={cx(k.stamp, t, className)}>{children}</span>;
}

/** Progress as painted trail blazes along a dashed path. */
export function Blazes({ pct, label, className }: { pct: number; label?: ReactNode; className?: string }) {
  const p = Math.max(0, Math.min(100, pct));
  return (
    <div className={cx(k.blazes, className)}>
      {label && <span className="num">{label}</span>}
      <span className={k.blazeTrack} role="progressbar" aria-valuenow={Math.round(p)} aria-valuemin={0} aria-valuemax={100}>
        {p > 0 && <span className={k.blazeDone} style={{ width: `${Math.max(p, 4)}%` }} />}
      </span>
    </div>
  );
}

/** The teacher's green circle round the right answer. Put it inside a positioned wrapper. */
export function PenCircle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden className={k.penCircle} viewBox="0 0 300 70" preserveAspectRatio="none" {...props}>
      <path d="M40 12C110 0 250 2 286 22c18 14-6 34-70 40-80 8-180 6-205-12C-6 36 18 16 70 8" />
    </svg>
  );
}

/** The teacher's red line through a wrong answer. */
export function PenStrike(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden className={k.penStrike} viewBox="0 0 300 20" preserveAspectRatio="none" {...props}>
      <path d="M6 12c40-6 90 4 140-2s100-6 148 2" />
    </svg>
  );
}

/** A grade in red pen, circled. */
export function PenGrade({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <span className={k.grade} aria-label={label}>
      <svg aria-hidden viewBox="0 0 160 120" preserveAspectRatio="none">
        <path d="M30 22C70 4 140 8 152 44c10 34-30 66-84 68-46 2-66-22-62-50S40 14 96 10" />
      </svg>
      <span className="num">{children}</span>
    </span>
  );
}

/**
 * Steps on a trail: an ordered list of stations along a dashed red path, each a numbered node in the
 * guide's hand and a sheet of paper that links on. For things that have a learning order.
 */
export function StepRoad({
  steps,
}: {
  steps: { href: string; title: string; description?: ReactNode; meta?: ReactNode; icon?: FieldIconName }[];
}) {
  return (
    <ol className={k.road}>
      {steps.map((st, i) => (
        <li key={st.href} className={k.step}>
          <span aria-hidden className={k.stepNode}>
            {i + 1}
          </span>
          <Link href={st.href} className={cx(k.paper, k.paperLink, k.tilt, i % 2 === 1 && k.tiltAlt, k.stepCard)}>
            <span className={k.stepTitle}>
              {st.icon && <InkIcon name={st.icon} size={28} />}
              {st.title}
            </span>
            {st.description && <span className={k.stepDesc}>{st.description}</span>}
            {st.meta && <span className={cx(k.stepMeta, "pencil")}>{st.meta}</span>}
          </Link>
        </li>
      ))}
    </ol>
  );
}
