import Link from "next/link";
import { PageHead, TrailPage } from "@/components/trail/kit";
import { PageDecor } from "@/components/trail/PageDecor";
import { InkIcon } from "@/components/trail/Ink";
import s from "@/components/summaries/summaries.module.css";
import { SUMMARIES } from "@/data/summaries";
import { topicOf } from "@/data/topics";
import { domainStyle } from "@/lib/domains";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "סיכומים למורי דרך",
  description:
    "סיכומי נושאי הסילבוס למבחן הרישוי ולעבודה בשטח: תמונת־על, תאריכים, דמויות, מושגים ואתרים.",
  path: "/summaries",
});

export default function SummariesPage() {
  return (
    <TrailPage decor={<PageDecor items={["resources", "notebooks", "pencil", "milestone"]} />}>
      <PageHead
        section="topics"
        title="סיכומים"
        art={<InkIcon name="resources" size={72} />}
        lede="כל נושא בעמוד אחד: התמונה הגדולה, מה לזכור למבחן ומה רואים בשטח."
      />

      <div className={s.indexBody}>
        <div className={s.cardGrid}>
          {SUMMARIES.map((summary) => {
            const topic = topicOf(summary.key);

            return (
              <Link
                key={summary.key}
                href={`/summaries/${summary.key}/`}
                className={s.card}
                style={domainStyle(topic?.key ?? summary.key)}
              >
                <span className={s.cardMark} aria-hidden />
                <span className={s.cardBody}>
                  <span className={s.cardKicker}>
                    {topic?.label ?? "נושא בסילבוס"}
                  </span>
                  <span className={s.cardTitle}>{summary.title}</span>
                  <span className={s.cardLede}>{summary.lede}</span>
                  <span className={s.cardMore}>לקריאת הסיכום</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </TrailPage>
  );
}
