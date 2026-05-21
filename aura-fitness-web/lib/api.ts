const LOCAL_API_BASE_URL = "http://localhost:8082/api";
const PRODUCTION_API_BASE_URL = "https://ducle-backend.onrender.com/api";

function getDefaultApiBaseUrl() {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return LOCAL_API_BASE_URL;
    }
  }

  return PRODUCTION_API_BASE_URL;
}

const configuredBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL && process.env.NEXT_PUBLIC_API_BASE_URL.trim().length > 0
    ? process.env.NEXT_PUBLIC_API_BASE_URL.trim()
    : getDefaultApiBaseUrl();

function normalizeApiBaseUrl(url: string) {
  const withoutTrailingSlash = url.replace(/\/+$/, "");
  return withoutTrailingSlash.endsWith("/api") ? withoutTrailingSlash : `${withoutTrailingSlash}/api`;
}

export const API_BASE_URL = normalizeApiBaseUrl(configuredBaseUrl);
// Robustly derive BASE_URL (the host without /api)
export const BASE_URL = API_BASE_URL.replace(/\/api$/, "").replace(/\/+$/, "");

type ApiErrorBody = {
  message?: unknown;
  error?: unknown;
  [key: string]: unknown;
};

type ApiError = Error & {
  status: number;
  statusText: string;
  body: unknown;
};

/**
 * Ensures an image URL is absolute, prepending the backend BASE_URL if necessary.
 */
export function getFullImageUrl(url: string | null | undefined): string {
  if (!url) return "/onboarding/body-scan-demo.svg";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  // Ensure we don't double slash
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${BASE_URL}${cleanUrl}`;
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (headers.get("Content-Type") === "null") {
    headers.delete("Content-Type");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend đang chạy.");
  }

  if (!response.ok) {
    if ((response.status === 401 || response.status === 403) && typeof window !== "undefined") {
      localStorage.removeItem("auth-token");
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    const contentType = response.headers.get("content-type") || "";
    let parsedBody: unknown = null;
    let bodyMessage = "";

    if (contentType.includes("application/json")) {
      parsedBody = await response.json().catch(() => null);
      if (parsedBody && typeof parsedBody === "object") {
        const errorBody = parsedBody as ApiErrorBody;
        const serverMessage = errorBody.message ?? errorBody.error;
        bodyMessage = typeof serverMessage === "string" ? serverMessage : JSON.stringify(serverMessage ?? errorBody);
      } else if (typeof parsedBody === "string") {
        bodyMessage = parsedBody;
      }
    } else {
      bodyMessage = await response.text().catch(() => "");
    }

    const statusText = response.statusText ? ` ${response.statusText}` : "";
    const message = (bodyMessage && String(bodyMessage).trim()) || `API error: ${response.status}${statusText}`;

    const error = new Error(message) as ApiError;
    // Attach extra metadata for callers/tests if needed
    error.status = response.status;
    error.statusText = response.statusText;
    error.body = parsedBody ?? bodyMessage;

    throw error;
  }

  // Handle case where response might be empty or plain text (like register success)
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }
  
  return response.text() as Promise<T>;
}
