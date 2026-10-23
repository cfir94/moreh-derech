// יצירת אסימון זמני (ephemeral token) נעול לשיחה אחת.
// בלי lockAdditionalFields, כל שדות ה-LiveConnectConfig נעולים (ראו docs/api-notes.md):
// ההוראות, הקול, הכלים, התמלול, הדחיסה וה-handle של החידוש נקבעים כאן בלבד.

import { buildSystemInstruction, SEARCH_TOOL, type ServerCharacter } from "./prompt.ts";

export interface LiveConfig {
  responseModalities: string[];
  systemInstruction: string;
  speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: string } } };
  tools: { functionDeclarations: (typeof SEARCH_TOOL)[] }[];
  inputAudioTranscription: Record<string, never>;
  outputAudioTranscription: Record<string, never>;
  contextWindowCompression: { slidingWindow: Record<string, never> };
  sessionResumption: { handle?: string };
}

export function buildLiveConfig(character: ServerCharacter, resumeHandle?: string): LiveConfig {
  return {
    responseModalities: ["AUDIO"],
    systemInstruction: buildSystemInstruction(character),
    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: character.voiceName } } },
    tools: [{ functionDeclarations: [SEARCH_TOOL] }],
    inputAudioTranscription: {},
    outputAudioTranscription: {},
    contextWindowCompression: { slidingWindow: {} },
    sessionResumption: resumeHandle ? { handle: resumeHandle } : {},
  };
}

export interface TokenRequest {
  apiKey: string;
  apiVersion: string;
  model: string;
  character: ServerCharacter;
  /** תחילת השיחה המקורית — גם חידוש לא מאריך את התקרה. */
  sessionStartedAt: number;
  maxSessionMinutes: number;
  resumeHandle?: string;
  now?: number;
}

export interface CreateTokenParams {
  config: {
    uses: number;
    expireTime: string;
    newSessionExpireTime: string;
    liveConnectConstraints: { model: string; config: LiveConfig };
    httpOptions: { apiVersion: string };
  };
}

export type TokenCreator = (apiKey: string, apiVersion: string, params: CreateTokenParams) => Promise<{ name?: string }>;

/** ברירת המחדל: ה-SDK הרשמי. נטען בעצלתיים כדי שבדיקות יוכלו להזריק מימוש מדומה. */
export const sdkCreateToken: TokenCreator = async (apiKey, apiVersion, params) => {
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion } });
  // הטיפוסים שלנו מחרוזות פשוטות (גם בבדיקות); בזמן ריצה הם זהים לערכי ה-enum של ה-SDK.
  return ai.authTokens.create(params as unknown as Parameters<typeof ai.authTokens.create>[0]);
};

export function tokenParams(req: TokenRequest): CreateTokenParams {
  const now = req.now ?? Date.now();
  const expireAt = req.sessionStartedAt + (req.maxSessionMinutes + 2) * 60_000;
  return {
    config: {
      uses: 1,
      expireTime: new Date(expireAt).toISOString(),
      newSessionExpireTime: new Date(now + 60_000).toISOString(),
      liveConnectConstraints: { model: req.model, config: buildLiveConfig(req.character, req.resumeHandle) },
      httpOptions: { apiVersion: req.apiVersion },
    },
  };
}

export async function createLockedToken(req: TokenRequest, create: TokenCreator = sdkCreateToken) {
  const params = tokenParams(req);
  const token = await create(req.apiKey, req.apiVersion, params);
  if (!token.name) throw new Error("Gemini returned no token name");
  return { token: token.name, expiresAt: params.config.expireTime };
}
