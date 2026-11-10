/* עקומות הקשתות, בלי three.js: משמשות גם את ההשוואה הדו־ממדית וגם את המודל. */
import type { Profile } from "@/data/arches/arches";

export const SPAN = 4; // רוחב הפתח

export type Pt = [number, number];

/** נקודות פנים הקשת (intrados), משמאל לימין, מקו הזינוק. */
export function intrados(profile: Profile, n = 41): Pt[] {
  const h = SPAN / 2;
  const pts: Pt[] = [];
  if (profile === "round" || profile === "corbel") {
    for (let i = 0; i < n; i++) {
      const a = Math.PI - (Math.PI * i) / (n - 1);
      pts.push([h * Math.cos(a), h * Math.sin(a)]);
    }
  } else if (profile === "pointed") {
    // שתי קשתות ברדיוס 0.8 מהפתח, שמרכזיהן על קו הזינוק
    const R = SPAN * 0.8, c = R - h;
    const top = Math.acos(-c / R);
    const half = Math.floor(n / 2);
    for (let i = 0; i <= half; i++) {
      const a = Math.PI - ((Math.PI - top) * i) / half;
      pts.push([c + R * Math.cos(a), R * Math.sin(a)]);
    }
    for (let i = half - 1; i >= 0; i--) pts.push([-pts[i][0], pts[i][1]]);
  } else {
    // פרסה: מרכז מוגבה, הקשת ממשיכה מתחת לקו המרכז ונסגרת פנימה
    const lift = 0.95, r = Math.hypot(h, lift);
    const below = Math.asin(lift / r);
    for (let i = 0; i < n; i++) {
      const a = Math.PI + below - ((Math.PI + 2 * below) * i) / (n - 1);
      pts.push([r * Math.cos(a), lift + r * Math.sin(a)]);
    }
  }
  return pts;
}

