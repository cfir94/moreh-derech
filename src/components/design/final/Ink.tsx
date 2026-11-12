/*
 * "דיו במחברת שדה" (בחירת הבעלים, 12.11): כל הסימנים מצוירים בקו עט אחד עם רעד קל וקווי הצללה.
 * InkDefs מגדיר פעם אחת את מסנני הרעד; כל שאר הרכיבים מפנים אליהם.
 */
import type { SVGProps } from "react";
import { PATHS, type FieldIconName } from "../FieldIcons";

/** Put once per page: the pen-wobble filters, one per drawing scale. */
export function InkDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <defs>
        <filter id="ink24" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="1.5" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="0.55" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="ink64" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="5" />
          <feDisplacementMap in="SourceGraphic" scale="1.3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="ink200" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="8" />
          <feDisplacementMap in="SourceGraphic" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

/** One hatching stroke group per icon: the notebook's way of shading. */
const HATCH: Partial<Record<FieldIconName, string>> = {
  quizzes: "M8.5 18l2-2M8.5 15.5l2-2M8.5 13l2-2",
  exams: "M9.5 18.5l1.5-1.5M11.5 18.5l2-2M13.5 18.5l1-1",
  map: "M15.6 18.8l2-2M15.6 16.3l3-3M15.6 13.8l3-3M15.6 11.3l3-3",
  timelines: "M5 14.6l1.4-1.4M8 14.6l1.4-1.4M11 14.6l1.4-1.4M14 14.6l1.4-1.4",
  review: "M6.5 16l1.4-1.4M5.6 13.6l1.4-1.4",
  notes: "M16.2 19.5l2-2M14 19.5l2-2",
  community: "M10 12.5l1.4-1.4M10.4 10.2l1-1",
  me: "M7.5 15l1.6-1.6M10 15.4l2-2M12.6 15.4l2-2M15 15.2l1.6-1.6",
  notebooks: "M10 20l1.6-1.6M12.4 20l2-2M14.6 20l1.4-1.4",
  "guide-reports": "M7 20l1.6-1.6M9.4 20l1.6-1.6",
  games: "M6 18.5l2-2M6 15.5l1.4-1.4",
  videos: "M5.5 17.5l1.6-1.6M5.5 15l1.2-1.2",
  resources: "M5 16.8l1.6-1.6M5 14.2l1.6-1.6M5 11.6l1.6-1.6",
};

export function InkIcon({
  name,
  size = 28,
  ...rest
}: { name: FieldIconName; size?: number } & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      <g filter="url(#ink24)">
        <g strokeWidth={1.55}>{PATHS[name]}</g>
        {HATCH[name] && <path d={HATCH[name]} strokeWidth={0.85} opacity={0.75} />}
      </g>
    </svg>
  );
}

/**
 * הלוגו: אבן מיל רומית בדיו, עם סימון שביל (לבן–אדום–לבן) צבוע עליה, ושביל מקווקו שעובר לידה.
 * שלושת הדברים שהבעלים אהב נפגשים בסימן אחד. נקרא גם ב-32 פיקסלים: צללית האבן והפס האדום.
 */
export function InkLogo({ size = 56, ...rest }: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} role="img" aria-label="אבן דרך" {...rest}>
      <g filter="url(#ink64)" strokeLinecap="round" strokeLinejoin="round">
        {/* the trail, passing the stone and running on to the horizon */}
        <path
          d="M3 60c9-1 14-5 19-9M43 51c6-3 10-8 12-15s4-10 7-12"
          fill="none"
          stroke="var(--t-red, #b5382a)"
          strokeWidth="2.4"
          strokeDasharray="4.5 4"
        />
        {/* ground and grass */}
        <path d="M6 53c8-2 16-3 26-3s18 1 26 3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14 52.5l-1.5-4M16.5 52l.5-4.5M49 52l1-4M51.5 52.5l2-3.5" fill="none" stroke="var(--t-green, #4f7a2e)" strokeWidth="1.6" />
        {/* plinth */}
        <path d="M19.5 51.5v-5.2h25v5.2z" fill="var(--stone, #dcc692)" stroke="currentColor" strokeWidth="2" />
        {/* the stone */}
        <path
          d="M23.5 46.3 24.6 20C24.9 12 28 7 32 7s7.1 5 7.4 13l1.1 26.3z"
          fill="var(--stone, #dcc692)"
          stroke="currentColor"
          strokeWidth="2.3"
        />
        {/* the blaze, painted a little crooked */}
        <g transform="rotate(-4 32 21)">
          <path d="M25.4 15.5h13.2v11H25.4z" fill="#fbf6e6" stroke="currentColor" strokeWidth="0.9" />
          <path d="M25.4 19.2h13.2v3.7H25.4z" fill="var(--t-red, #b5382a)" />
        </g>
        {/* the inscription and the shaded side */}
        <path d="M27.5 32h9M27.5 36h9M29 40h6" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M37.6 44l2-2M37.4 40l2-2M37.2 36l1.9-1.9M37 32l1.7-1.7M36.8 28.6l1.5-1.5" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.75" />
      </g>
    </svg>
  );
}

/** A terebinth by the trail: ink outline, a green wash. */
export function InkTree(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden {...props}>
      <g filter="url(#ink64)" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke="currentColor">
        <path d="M12 26c-4-9 3-17 11-15 3-7 15-7 18 0 9-2 15 7 10 15 4 6-2 13-9 11-4 5-13 5-17 0-8 2-15-4-13-11z" fill="var(--t-green, #4f7a2e)" fillOpacity="0.4" strokeWidth="1.8" />
        <path d="M30 37c1 8 0 14-3 20M35 37c0 8 1 14 4 20M30 44l-6-5M36 46l6-5" strokeWidth="1.8" />
        <path d="M18 57c9-2 20-2 30 0" strokeWidth="1.4" />
        <path d="M20 24l3-3M26 20l3-3M34 26l3-3M41 21l3-3M24 31l3-3M38 32l3-3" strokeWidth="1" opacity="0.7" />
      </g>
    </svg>
  );
}

/** A broken column on a tel: what the guide points at. */
export function InkRuin(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden {...props}>
      <g filter="url(#ink64)" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke="currentColor">
        <path d="M4 56c10-6 20-8 30-8s20 2 26 8" strokeWidth="1.5" />
        <path d="M17 49V22l3-4 4 3 3-3 3 4v27z" fill="var(--stone, #dcc692)" strokeWidth="1.9" />
        <path d="M14 49h19v4H14z" fill="var(--stone, #dcc692)" strokeWidth="1.9" />
        <path d="M20.5 24v23M24 24v23M27.5 24v23" strokeWidth="1" opacity="0.7" />
        <path d="M38 49V34h9v15zM36 49h13v4H36zM36.5 34h12v-3.5h-12z" fill="var(--stone, #dcc692)" strokeWidth="1.9" />
        <path d="M52 55l5-2 2 3M8 53l3-2" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

/** Compass rose, with צ for north in the guide's own hand. */
export function InkCompass(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden {...props}>
      <g filter="url(#ink200)" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="100" cy="108" r="62" strokeWidth="2.2" />
        <circle cx="100" cy="108" r="52" strokeWidth="1" strokeDasharray="2 7" />
        <path d="M100 38 112 96 100 108 88 96z" fill="var(--t-red, #b5382a)" strokeWidth="2" />
        <path d="M100 178 88 120 100 108 112 120z" strokeWidth="2" />
        <path d="M30 108 88 96 100 108 88 120zM170 108 112 120 100 108 112 96z" strokeWidth="2" />
        <path d="M56 64l24 24M144 64l-24 24M56 152l24-24M144 152l-24-24" strokeWidth="1.3" />
        <path d="M104 100l6-6M104 106l8-8M106 112l6-6" strokeWidth="1" opacity="0.7" />
      </g>
      <text x="100" y="30" textAnchor="middle" fontSize="34" fill="currentColor" style={{ fontFamily: "var(--font-hand)" }}>
        צ
      </text>
    </svg>
  );
}

/** A hand-drawn arrow for margin notes. */
export function InkArrow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 40" aria-hidden {...props}>
      <g filter="url(#ink64)" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M60 8C44 4 24 8 10 28" />
        <path d="M8 16l1.5 13 12-4" />
      </g>
    </svg>
  );
}
