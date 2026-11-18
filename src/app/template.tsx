/*
 * Every page rises in gently when you arrive at it (owner, 18.11). A template, unlike the layout,
 * mounts afresh on each navigation, so the animation plays on every page and not only the first.
 * The animation leaves no transform behind, so sticky and fixed elements behave once it ends;
 * with reduced motion the global rule in globals.css cuts it to nothing.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
