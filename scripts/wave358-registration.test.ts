import { afterEach, describe, expect, mock, test } from "bun:test";
import {
  createRegistration,
  normaliseRegistrationPhone,
  saveRegistrationPreferences,
} from "../src/lib/registration";

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("registration transport", () => {
  test("normalises supported UK formats and rejects incomplete or Unicode numbers", () => {
    for (const raw of ["07700 900123", "+44 7700 900123", "0044 7700 900123", "(07700) 900123"])
      expect(normaliseRegistrationPhone(raw)).toBe("+447700900123");
    for (const raw of ["", "12345", "+44770090012", "+4407700900123", "+44７７００９００１２３"])
      expect(normaliseRegistrationPhone(raw)).toBeNull();
  });

  test("account success requires a real pending response and a capability", async () => {
    const details = {
      request_id: "00000000-0000-4000-8000-000000000001",
      role: "investor",
      email: "test@example.test",
      phone: "+447700900123",
      password: "LocalTestOnly42",
      consent_email: false,
      consent_sms: false,
      consent_version: "2026-09-10",
      source: "site-register" as const,
    };
    const capture = mock(
      async () =>
        new Response(
          JSON.stringify({ status: "pending_activation", registration_token: "opaque" }),
          { status: 201 },
        ),
    );
    globalThis.fetch = capture as unknown as typeof fetch;
    expect(await createRegistration(details)).toBe("opaque");
    const request = capture.mock.calls[0] as unknown as [string, RequestInit];
    expect(request[0]).toEndWith("/public/registration");
    expect(JSON.parse(String(request[1].body))).toEqual(details);
    globalThis.fetch = mock(
      async () => new Response(JSON.stringify({ ok: true })),
    ) as unknown as typeof fetch;
    await expect(createRegistration(details)).rejects.toMatchObject({ kind: "network" });
  });

  test("survey saves only scoped answers, clears blank profile values and never sends credentials", async () => {
    const capture = mock(async () => new Response(JSON.stringify({ status: "saved" })));
    globalThis.fetch = capture as unknown as typeof fetch;
    await saveRegistrationPreferences(
      "scoped-token",
      { preferred_regions: ["East Midlands"] },
      false,
    );
    const request = capture.mock.calls[0] as unknown as [string, RequestInit];
    expect(request[0]).toEndWith("/public/registration/preferences");
    expect(JSON.parse(String(request[1].body))).toEqual({
      registration_token: "scoped-token",
      answers: { preferred_regions: ["East Midlands"] },
      complete: false,
      name: "",
      organisation: "",
    });
    expect(request[1].credentials).toBe("omit");
  });

  test.each([
    [429, {}, "rateLimited"],
    [503, {}, "network"],
    [400, { detail: "registration_session_expired" }, "expired"],
    [422, {}, "rejected"],
    [400, { detail: { password_policy: ["too_common"] } }, "password"],
  ])("classifies HTTP %s without exposing backend data", async (status, body, kind) => {
    globalThis.fetch = mock(
      async () => new Response(JSON.stringify(body), { status: Number(status) }),
    ) as unknown as typeof fetch;
    await expect(saveRegistrationPreferences("opaque", {}, false)).rejects.toMatchObject({ kind });
  });

  test("does not claim a save when an HTML fallback or unexpected JSON arrives", async () => {
    for (const body of ["<!doctype html>", "{}", "null", "[]"]) {
      globalThis.fetch = mock(async () => new Response(body)) as unknown as typeof fetch;
      await expect(saveRegistrationPreferences("opaque", {}, true)).rejects.toMatchObject({
        kind: "network",
      });
    }
  });
});
