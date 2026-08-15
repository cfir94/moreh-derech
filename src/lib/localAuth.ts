export type LocalUser = {
  name: string;
  email: string;
};

const USER_KEY = "md_user_v1";

export function readUser(): LocalUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.name || !parsed?.email) return null;
    return parsed as LocalUser;
  } catch {
    return null;
  }
}

export function writeUser(user: LocalUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(USER_KEY);
}
