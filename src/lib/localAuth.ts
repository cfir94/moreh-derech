export type LocalUser = {
  name: string;
  email: string;
};

export const USER_KEY = "md_user_v1";
export const USER_EVENT = "md-user-changed";

/** Pure parse of the stored JSON, tolerant of corrupt or absent data. */
export function parseUser(raw: string | null): LocalUser | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.name || !parsed?.email) return null;
    return { name: parsed.name, email: parsed.email };
  } catch {
    return null;
  }
}

export function readUser(): LocalUser | null {
  if (typeof window === "undefined") return null;
  return parseUser(window.localStorage.getItem(USER_KEY));
}

export function writeUser(user: LocalUser) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* private mode — login simply won't persist */
  }
}

export function clearUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(USER_KEY);
}
