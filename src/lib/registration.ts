import { apiUrl } from "@/lib/api";

export type SurveyAnswers = Record<string, string | string[]>;

export type RegistrationFailure = "network" | "rateLimited" | "rejected" | "expired" | "password";

export class RegistrationError extends Error {
  constructor(public kind: RegistrationFailure) {
    super(kind);
  }
}

export function normaliseRegistrationPhone(raw: string): string | null {
  const compact = raw.trim().replace(/[\s().-]/g, "");
  const national = compact.startsWith("+44")
    ? compact.slice(3)
    : compact.startsWith("0044")
      ? compact.slice(4)
      : compact.startsWith("0")
        ? compact.slice(1)
        : null;
  return national && /^[1-9][0-9]{9}$/.test(national) ? `+44${national}` : null;
}

export interface AccountDetails {
  request_id: string;
  role: string;
  email: string;
  phone: string;
  password: string;
  consent_email: boolean;
  consent_sms: boolean;
  consent_version: string;
  source: "site-register";
}

async function post(path: string, payload: unknown): Promise<Record<string, unknown>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(apiUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
      credentials: "omit",
      cache: "no-store",
    });
    if (!response.ok) {
      if (response.status === 429) throw new RegistrationError("rateLimited");
      if (response.status === 401 || response.status === 403)
        throw new RegistrationError("expired");
      if (response.status >= 500) throw new RegistrationError("network");
      const body = await response.json().catch(() => null);
      if (body?.detail === "registration_session_expired") {
        throw new RegistrationError("expired");
      }
      if (body?.detail?.password_policy) throw new RegistrationError("password");
      throw new RegistrationError("rejected");
    }
    const body: unknown = await response.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new RegistrationError("network");
    }
    return body as Record<string, unknown>;
  } catch (error) {
    if (error instanceof RegistrationError) throw error;
    throw new RegistrationError("network");
  } finally {
    clearTimeout(timer);
  }
}

export async function createRegistration(details: AccountDetails): Promise<string> {
  const result = await post("/public/registration", details);
  if (
    result["status"] !== "pending_activation" ||
    typeof result["registration_token"] !== "string" ||
    !result["registration_token"]
  ) {
    throw new RegistrationError("network");
  }
  return result["registration_token"];
}

export async function saveRegistrationPreferences(
  registrationToken: string,
  answers: SurveyAnswers,
  complete: boolean,
  name?: string,
  organisation?: string,
): Promise<void> {
  const result = await post("/public/registration/preferences", {
    registration_token: registrationToken,
    answers,
    complete,
    name: name?.trim() ?? "",
    organisation: organisation?.trim() ?? "",
  });
  if (result["status"] !== "saved") throw new RegistrationError("network");
}
