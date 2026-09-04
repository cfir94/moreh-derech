export type Resource = {
  slug?: string;
  title: string;
  note?: string;
  url: string;
};

export type ResourceGroup = {
  slug: string;
  title: string;
  description: string;
  items: Resource[];
};

/**
 * Whose materials these are. Shown wherever a link to them appears: the
 * directory is useful precisely because someone else wrote and maintains it.
 */
export const RESOURCE_SOURCE = {
  name: "אפרת נקש",
  page: "https://www.efratnakash.com/touring-israel-tips-h.asp",
  site: "https://www.efratnakash.com",
};
