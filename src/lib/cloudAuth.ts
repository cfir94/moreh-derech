/*
 * Shared authentication with the "אבן דרך" game.
 *
 * Both projects intentionally use the same Supabase project, password
 * derivation salt and localStorage session key. On GitHub Pages they also
 * share an origin, so a session created in either app is immediately visible
 * to the other app.
 */

const SUPABASE_URL = "https://dendxtbaxiszohjjsdtd.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbmR4dGJheGlzem9oampzZHRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2OTMzMTcsImV4cCI6MjEwMjI2OTMxN30.rDYzH-3Pz2-XOYoUgrJW7GfTvdrZ7usqbSdtTZ4my6g";

export const SESSION_KEY = "israel-geo-game-session";
export const AUTH_EVENT = "shared-auth-changed";

// Historical game value. Changing it would lock existing users out.
const PASSWORD_SALT = "mapat-haaretz/v1";

export type SharedSession = {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email: string;
  display_name: string;
  class_code?: string;
  is_teacher?: boolean;
};

export type SharedUser = {
  id: string;
  name: string;
  email: string;
  classCode: string;
  isTeacher: boolean;
};

type AuthResponse = {
  access_token?: string;
  refresh_token?: string;
  user?: {
    id?: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  };
};

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
};

export class CloudAuthError extends Error {
  status?: number;
  needsConfirm?: boolean;
}

export function parseSession(raw: string | null): SharedSession | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<SharedSession>;
    if (
      !value.access_token ||
      !value.refresh_token ||
      !value.user_id ||
      !value.email
    ) {
      return null;
    }
    return {
      access_token: value.access_token,
      refresh_token: value.refresh_token,
      user_id: value.user_id,
      email: value.email,
      display_name: value.display_name ?? "",
      class_code: value.class_code ?? "",
      is_teacher: Boolean(value.is_teacher),
    };
  } catch {
    return null;
  }
}

export function readSession(): SharedSession | null {
  if (typeof window === "undefined") return null;
  return parseSession(window.localStorage.getItem(SESSION_KEY));
}

export function userFromSession(session: SharedSession | null): SharedUser | null {
  if (!session) return null;
  return {
    id: session.user_id,
    name: session.display_name || session.email.split("@")[0] || "משתמש",
    email: session.email,
    classCode: session.class_code ?? "",
    isTeacher: Boolean(session.is_teacher),
  };
}

function saveSession(session: SharedSession | null) {
  if (typeof window === "undefined") return;
  try {
    if (session) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  } finally {
    window.dispatchEvent(new Event(AUTH_EVENT));
  }
}

async function request(path: string, options: RequestOptions = {}) {
  const {
    method = "GET",
    body,
    auth = true,
    headers = {},
  } = options;
  const session = readSession();
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
      ...(auth && session
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 204) return null;
  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const detail = data as Record<string, unknown> | null;
    const message =
      detail?.msg ??
      detail?.message ??
      detail?.error_description ??
      detail?.error ??
      `שגיאת שרת ${response.status}`;
    const error = new CloudAuthError(String(message));
    error.status = response.status;
    throw error;
  }
  return data;
}

let refreshing: Promise<void> | null = null;

async function refreshSession() {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const current = readSession();
    if (!current?.refresh_token) throw new CloudAuthError("אין התחברות פעילה");
    try {
      const response = (await request(
        "/auth/v1/token?grant_type=refresh_token",
        {
          method: "POST",
          auth: false,
          body: { refresh_token: current.refresh_token },
        },
      )) as AuthResponse;
      if (!response.access_token || !response.refresh_token) {
        throw new CloudAuthError("השרת לא החזיר התחברות תקינה");
      }
      saveSession({
        ...current,
        access_token: response.access_token,
        refresh_token: response.refresh_token,
      });
    } catch (error) {
      if (error instanceof CloudAuthError && error.status === 400) {
        saveSession(null);
      }
      throw error;
    }
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

async function withAuth<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (
      !(error instanceof CloudAuthError) ||
      error.status !== 401 ||
      !readSession()?.refresh_token
    ) {
      throw error;
    }
    await refreshSession();
    return action();
  }
}

function unpack(response: AuthResponse, fallbackName = ""): SharedSession {
  const meta = response.user?.user_metadata ?? {};
  if (
    !response.access_token ||
    !response.refresh_token ||
    !response.user?.id ||
    !response.user.email
  ) {
    throw new CloudAuthError("השרת לא החזיר התחברות תקינה");
  }
  return {
    access_token: response.access_token,
    refresh_token: response.refresh_token,
    user_id: response.user.id,
    email: response.user.email,
    display_name: String(meta.display_name ?? fallbackName),
    class_code: String(meta.class_code ?? ""),
    is_teacher: false,
  };
}

async function derivedPassword(email: string) {
  const normalized = email.trim().toLowerCase();
  const data = new TextEncoder().encode(`${normalized}|${PASSWORD_SALT}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = Array.from(new Uint8Array(digest));
  const binary = bytes.map((byte) => String.fromCharCode(byte)).join("");
  const base64 = btoa(binary);
  return `Gg1!${base64.replace(/[^A-Za-z0-9]/g, "").slice(0, 28)}`;
}

function normalizeClass(value: string) {
  return String(value || "")
    .replace(/[״“”„«»]/g, '"')
    .replace(/[׳‘’ʼ]/g, "'")
    .replace(/[‐-―−]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

async function signUp(
  email: string,
  password: string,
  displayName: string,
  classCode: string,
) {
  const response = (await request("/auth/v1/signup", {
    method: "POST",
    auth: false,
    body: {
      email,
      password,
      data: { display_name: displayName, class_code: classCode },
    },
  })) as AuthResponse;
  if (!response.access_token) {
    const error = new CloudAuthError(
      'נדרש אישור מייל. יש לכבות את "Confirm email" בהגדרות Supabase.',
    );
    error.needsConfirm = true;
    throw error;
  }
  const session = unpack(response, displayName);
  saveSession(session);
  await ensureProfile(displayName, classCode);
  return readSession()!;
}

export async function signIn(email: string, password: string) {
  const response = (await request("/auth/v1/token?grant_type=password", {
    method: "POST",
    auth: false,
    body: { email, password },
  })) as AuthResponse;
  const session = unpack(response);
  saveSession(session);
  await refreshProfile();
  return readSession()!;
}

export async function quickAuth(
  rawEmail: string,
  displayName: string,
  classCode = "",
) {
  const email = rawEmail.trim().toLowerCase();
  const password = await derivedPassword(email);
  const normalizedClass = normalizeClass(classCode);
  try {
    return await signUp(email, password, displayName, normalizedClass);
  } catch (error) {
    if (error instanceof CloudAuthError && error.needsConfirm) throw error;
    const session = await signIn(email, password);
    const nameChanged = displayName && displayName !== session.display_name;
    const classChanged = normalizedClass && normalizedClass !== session.class_code;
    if (nameChanged || classChanged) {
      await ensureProfile(
        displayName || session.display_name,
        normalizedClass || session.class_code || "",
      );
    }
    return readSession()!;
  }
}

async function ensureProfile(displayName: string, classCode: string) {
  const session = readSession();
  if (!session) return;
  const row: Record<string, unknown> = {
    id: session.user_id,
    display_name: displayName || session.display_name || "",
  };
  if (classCode || session.class_code) {
    row.class_code = classCode || session.class_code;
  }
  await withAuth(() =>
    request("/rest/v1/profiles", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: [row],
    }),
  );
  saveSession({
    ...session,
    display_name: String(row.display_name),
    class_code: String(row.class_code ?? session.class_code ?? ""),
  });
}

export async function refreshProfile() {
  const session = readSession();
  if (!session) return null;
  const rows = (await withAuth(() =>
    request(
      `/rest/v1/profiles?id=eq.${encodeURIComponent(session.user_id)}` +
        "&select=display_name,class_code,is_teacher",
    ),
  )) as Array<{
    display_name?: string;
    class_code?: string;
    is_teacher?: boolean;
  }>;
  const profile = rows?.[0];
  if (!profile) return userFromSession(readSession());
  saveSession({
    ...readSession()!,
    display_name: profile.display_name || session.display_name,
    class_code: profile.class_code ?? session.class_code ?? "",
    is_teacher: Boolean(profile.is_teacher),
  });
  return userFromSession(readSession());
}

export function signOut() {
  saveSession(null);
}

export function friendlyAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const normalized = message.toLowerCase();
  if (error instanceof CloudAuthError && error.needsConfirm) return message;
  if (normalized.includes("invalid login")) return "אימייל או סיסמה שגויים";
  if (normalized.includes("already registered")) return "האימייל הזה כבר רשום";
  if (normalized.includes("failed to fetch") || normalized.includes("networkerror")) {
    return "אין חיבור לשרת. בדקו את החיבור לאינטרנט ונסו שוב.";
  }
  if (normalized.includes("refresh token")) {
    return "תוקף ההתחברות פג. היכנסו שוב עם אותו אימייל.";
  }
  if (normalized.includes("password")) return "הסיסמה אינה תקינה";
  return message || "משהו השתבש. נסו שוב.";
}

export function isLegacyPasswordError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  return message.includes("invalid login") || message.includes("credential");
}
