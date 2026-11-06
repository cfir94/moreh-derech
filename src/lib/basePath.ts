// Next's <Link>/router prefix basePath automatically for app routes, but raw
// asset URLs (quiz images, the embedded map) are plain strings and need it
// prepended by hand. Keep in sync with next.config.ts: both read NEXT_PUBLIC_BASE_PATH at build time
// ("/moreh-derech" on GitHub Pages, "" on Cloudflare). Hard-coded "/moreh-derech/..." strings that
// remain in data files keep working on Cloudflare: deploy/site/worker.ts strips that prefix.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/moreh-derech";

/** Prefix a root-relative asset path (e.g. "/quiz-images/x.jpg") with basePath. */
export function withBasePath(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return `${BASE_PATH}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function embedUrl(path: string) {
  return `${BASE_PATH}/embeds/${path.replace(/^\/+/, "")}`;
}
