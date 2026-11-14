import { withBasePath } from "@/lib/basePath";

/** מסגרת "דפדפן" לצילום מסך או לסרטון שיווקי. */
export function BrowserFrame({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card shadow-[0_30px_70px_-40px_var(--teal)]">
      <div className="flex items-center gap-1.5 border-b border-line px-3 py-2" aria-hidden>
        <span className="size-2.5 rounded-full bg-line" />
        <span className="size-2.5 rounded-full bg-line" />
        <span className="size-2.5 rounded-full bg-line" />
        {label && <span className="mx-auto truncate text-[13px] text-txt-dim" dir="ltr">{label}</span>}
      </div>
      {children}
    </div>
  );
}

export function Shot({ src, alt, width = 1600, height = 1000 }: { src: string; alt: string; width?: number; height?: number }) {
  // eslint-disable-next-line @next/next/no-img-element -- static export: no image optimizer
  return <img src={withBasePath(`/marketing/${src}`)} alt={alt} width={width} height={height} loading="lazy" className="block h-auto w-full" />;
}

export function Clip({ name, label }: { name: string; label: string }) {
  return (
    <video
      className="block h-auto w-full"
      src={withBasePath(`/marketing/clip-${name}.mp4`)}
      poster={withBasePath(`/marketing/clip-${name}-poster.webp`)}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
    />
  );
}

/** מסגרת "טלפון" לצילום מסך צר. */
export function Phone({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-[28px] border-4 border-line bg-card shadow-[0_24px_50px_-30px_var(--blue)]">
      {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
      <img src={withBasePath(`/marketing/${src}`)} alt={alt} width={600} height={1022} loading="lazy" className="block h-auto w-full" />
    </div>
  );
}
