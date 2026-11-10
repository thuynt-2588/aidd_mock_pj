import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock only the network boundary: what Supabase says about the user, and the
// cookie writes it would perform while refreshing the session.
const getUser = vi.fn();
let refreshedCookies: { name: string; value: string; options: object }[] = [];

vi.mock("@supabase/ssr", () => ({
  createServerClient: (_url: string, _key: string, opts: { cookies: { setAll: (c: unknown, h?: unknown) => void } }) => ({
    auth: {
      getUser: async () => {
        if (refreshedCookies.length) opts.cookies.setAll(refreshedCookies, { "Cache-Control": "private, no-store" });
        return getUser();
      },
    },
  }),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

const { updateSupabaseSession } = await import("./proxy-session");

const request = (path: string) =>
  new NextRequest(`http://localhost:3000${path}`, { headers: { host: "127.0.0.1:3000" } });

describe("updateSupabaseSession", () => {
  beforeEach(() => {
    getUser.mockReset();
    refreshedCookies = [];
  });

  it("redirects a visitor without a user away from / to /login on the same host", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await updateSupabaseSession(request("/"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://127.0.0.1:3000/login");
    expect(res.headers.get("cache-control")).toContain("no-store");
  });

  it("lets a signed-in user through to /", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    const res = await updateSupabaseSession(request("/"));
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("does not guard public routes such as /login", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await updateSupabaseSession(request("/login"));
    expect(res.status).toBe(200);
  });

  it("forwards refreshed session cookies on a pass-through response", async () => {
    refreshedCookies = [{ name: "sb-access", value: "new-token", options: { path: "/" } }];
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    const res = await updateSupabaseSession(request("/"));
    expect(res.cookies.get("sb-access")?.value).toBe("new-token");
  });

  it("keeps cookie updates (e.g. a cleared session) on the redirect response", async () => {
    refreshedCookies = [{ name: "sb-access", value: "", options: { path: "/", maxAge: 0 } }];
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await updateSupabaseSession(request("/"));
    expect(res.status).toBe(307);
    expect(res.cookies.get("sb-access")).toBeDefined();
  });
});
