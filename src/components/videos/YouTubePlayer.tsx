"use client";

import { useEffect, useRef, useState } from "react";

type Player = { destroy: () => void };
type YouTubeApi = {
  Player: new (element: HTMLElement, options: {
    events: {
      onStateChange: (event: { data: number }) => void;
      onError: (event: { data: number }) => void;
    };
  }) => Player;
};
type ApiWindow = Window & {
  YT?: YouTubeApi;
  onYouTubeIframeAPIReady?: () => void;
};

let apiPromise: Promise<YouTubeApi> | undefined;
function loadPlayerApi() {
  const host = window as ApiWindow;
  if (host.YT?.Player) return Promise.resolve(host.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<YouTubeApi>((resolve, reject) => {
    const previousReady = host.onYouTubeIframeAPIReady;
    const timer = window.setTimeout(() => reject(new Error("YouTube API timeout")), 20_000);
    host.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timer);
      previousReady?.();
      if (host.YT?.Player) resolve(host.YT);
      else reject(new Error("YouTube API not available"));
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error("YouTube API request failed"));
    };
    document.head.appendChild(script);
  });
  apiPromise.catch(() => { apiPromise = undefined; });
  return apiPromise;
}

export function YouTubePlayer({ src, title, onEnded }: {
  src: string;
  title: string;
  onEnded: () => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const ended = useRef(onEnded);
  const [error, setError] = useState<number>();

  useEffect(() => { ended.current = onEnded; }, [onEnded]);

  useEffect(() => {
    if (!container.current) return;
    let disposed = false;
    let player: Player | undefined;
    const frame = document.createElement("iframe");
    const url = new URL(src);
    url.searchParams.set("origin", window.location.origin);
    frame.src = url.toString();
    frame.title = title;
    frame.className = "absolute inset-0 size-full border-0";
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    frame.allowFullscreen = true;
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    container.current.appendChild(frame);
    void loadPlayerApi().then((api) => {
      if (disposed) return;
      player = new api.Player(frame, {
        events: {
          onStateChange: ({ data }) => {
            if (!disposed && data === 0) ended.current();
          },
          onError: ({ data }) => { if (!disposed) setError(data); },
        },
      });
    }).catch(() => {
      // The ordinary embedded player still works if the optional API is blocked.
    });
    // A cross-origin frame never matches :focus in this document, so a keyboard user tabbing into the
    // player would see no focus ring. When focus moves into the frame this window blurs and the frame
    // becomes the active element: mark the box then, and clear it when focus comes back.
    const box = container.current;
    const onBlur = () => window.setTimeout(() => {
      if (document.activeElement === frame) box.dataset.frameFocus = "";
    });
    const onFocus = () => { delete box.dataset.frameFocus; };
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      disposed = true;
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      delete box.dataset.frameFocus;
      player?.destroy();
      frame.remove();
    };
  }, [src, title]);

  return (
    <div ref={container} className="absolute inset-0 data-[frame-focus]:outline-3 data-[frame-focus]:outline-offset-[-3px] data-[frame-focus]:outline-(--focus) data-[frame-focus]:outline-solid">
      {error !== undefined && (
        <div role="status" className="absolute inset-x-0 bottom-0 z-10 bg-[#07131c]/95 p-3 text-sm text-on-media">
          YouTube לא מאפשר כרגע לנגן את הסרטון הזה (קוד {error}). אפשר לבחור חלק אחר ברשימה למטה.
        </div>
      )}
    </div>
  );
}
