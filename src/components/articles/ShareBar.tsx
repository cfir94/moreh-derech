"use client";

/** שיתוף בסוף המאמר: וואטסאפ קודם, כי שם הקהל שלנו מעביר הלאה. */
import { useState } from "react";
import s from "./articles.module.css";

export function ShareBar({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const wa = `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the link is still visible in the address bar */
    }
  };
  return (
    <div className={s.share}>
      <p className={s.shareTitle}>הגעתם לסוף. מכירים מורה דרך שזה יעניין?</p>
      <div className={s.shareRow}>
        <a href={wa} target="_blank" rel="noopener noreferrer" className={`${s.shareBtn} ${s.shareWa}`}>שיתוף בוואטסאפ</a>
        <a href={fb} target="_blank" rel="noopener noreferrer" className={s.shareBtn}>פייסבוק</a>
        <button type="button" onClick={copy} className={s.shareBtn} aria-live="polite">{copied ? "הקישור הועתק" : "העתקת קישור"}</button>
      </div>
    </div>
  );
}
