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
    return () => {
      disposed = true;
      player?.destroy();
      frame.remove();
    };
  }, [src, title]);

  return (
    <div ref={container} className="absolute inset-0">
      {error !== undefined && (
        <div role="status" className="absolute inset-x-0 bottom-0 z-10 bg-[#07131c]/95 p-3 text-sm text-white">
          YouTube לא מאפשר כרגע לנגן את הסרטון הזה (קוד {error}). אפשר לבחור חלק אחר ברשימה למטה.
        </div>
      )}
    </div>
  );
}
