import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מצרים, כנען וראשית ישראל | אבן דרך למורי דרך",
  description: "ציר הזמן המקורי של מצרים, כנען וראשית ישראל",
};

export default function EgyptCanaanTimelinePage() {
  return (
    <div className="h-[calc(100dvh-60px)] min-h-[500px] w-full">
      <iframe
        src="https://egypt-timel-n69crndr.manus.space/"
        title="מצרים, כנען וראשית ישראל"
        className="h-full w-full border-0"
        allow="fullscreen"
        allowFullScreen
      />
    </div>
  );
}
