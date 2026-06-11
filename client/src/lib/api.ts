/**
 * Global API client for FreelanceSkills.
 *
 * Every request is sent with credentials:include so the Express session
 * cookie is attached automatically.
 *
 * If the server returns 401, syncSessionNow() is called once to re-establish
 * the session (covers tab-resume, token-expiry, and post-login races),
 * then the request is retried exactly once.
 */

import { syncSessionNow } from "@/hooks/use-auth";

export interface ApiOptions extends Omit<RequestInit, "body"> {
  json?: unknown;
  body?: BodyInit | null;
}

function buildInit(options: ApiOptions = {}): RequestInit {
  const { json, body, headers: extraHeaders, ...rest } = options;
  const headers: HeadersInit = {
    ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(extraHeaders ?? {}),
  };
  return {
    credentials: "include",
    ...rest,
    ...(json !== undefined ? { body: JSON.stringify(json) } : body !== undefined ? { body } : {}),
    headers,
  };
}

/** Raw fetch with auto 401-retry. Returns the Response object. */
export async function apiFetch(url: string, options: ApiOptions = {}): Promise<Response> {
  const init = buildInit(options);
  let res = await fetch(url, init);
  if (res.status === 401) {
    await syncSessionNow();
    res = await fetch(url, init);
  }
  return res;
}

/**
 * Convenience wrapper that parses JSON and throws a descriptive error
 * on non-2xx responses.
 */
export async function apiJson<T = unknown>(url: string, options: ApiOptions = {}): Promise<T> {
  const res = await apiFetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error((body?.message as string) ?? `HTTP ${res.status} — ${url}`);
  }
  return res.json() as Promise<T>;
}

/** POST JSON helper */
export const apiPost = <T = unknown>(url: string, body: unknown, opts?: ApiOptions) =>
  apiJson<T>(url, { method: "POST", json: body, ...opts });

/** PATCH JSON helper */
export const apiPatch = <T = unknown>(url: string, body: unknown, opts?: ApiOptions) =>
  apiJson<T>(url, { method: "PATCH", json: body, ...opts });

/** DELETE helper */
export const apiDelete = <T = unknown>(url: string, opts?: ApiOptions) =>
  apiJson<T>(url, { method: "DELETE", ...opts });
