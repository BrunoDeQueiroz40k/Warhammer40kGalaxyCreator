import { JsonValue } from "../types/interfaces";

let activeRequests = 0;

export class ApiClient {
  constructor(private baseUrl: string) { }

  private url(path: string) {
    if (path.startsWith("http")) return path;
    return `${this.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  }

  async request<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
    if (typeof window !== "undefined") {
      if (activeRequests === 0) {
        window.showLoading?.();
      }
      activeRequests += 1;
      window.updateLoadingProgress?.(30, "Conectando ao servidor...");
    }

    try {
      const res = await fetch(this.url(path), {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init.headers ?? {}),
        },
        credentials: "include",
      });

      if (typeof window !== "undefined") {
        window.updateLoadingProgress?.(70, "Processando resposta...");
      }

      if (res.status === 204) return undefined as T;

      const contentType = res.headers.get("content-type") ?? "";
      const isJson = contentType.includes("application/json");
      const body = (isJson ? await res.json() : await res.text()) as JsonValue;

      if (!res.ok) {
        const msg =
          typeof body === "object" && body && "error" in body
            ? String((body as any).error)
            : `HTTP_${res.status}`;
        throw new Error(msg);
      }

      return body as T;
    } finally {
      if (typeof window !== "undefined") {
        activeRequests = Math.max(0, activeRequests - 1);
        if (activeRequests === 0) {
          window.hideLoading?.();
        }
      }
    }
  }
}

export const api = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
);
