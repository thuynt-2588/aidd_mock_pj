import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { prelaunchGateResponse } from "./prelaunch-proxy";

const OPEN_ISO = "2026-12-01T09:00:00+07:00";
const OPEN = Date.parse(OPEN_ISO);

const request = (path: string) =>
  new NextRequest(`http://localhost:3000${path}`, { headers: { host: "127.0.0.1:3000" } });

describe("prelaunchGateResponse", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("redirects to /prelaunch on the same host before the opening time", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_OPEN_AT", OPEN_ISO);
    for (const path of ["/", "/login", "/awards-information"]) {
      const res = prelaunchGateResponse(request(path), OPEN - 60_000);
      expect(res?.status).toBe(307);
      expect(res?.headers.get("location")).toBe("http://127.0.0.1:3000/prelaunch");
      expect(res?.headers.get("cache-control")).toContain("no-store");
    }
  });

  it("is independent of the event start used by the homepage countdown", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_OPEN_AT", "");
    vi.stubEnv("NEXT_PUBLIC_EVENT_START_AT", "2099-01-01T00:00:00+07:00");
    expect(prelaunchGateResponse(request("/"), OPEN)).toBeNull();
  });

  it("passes through after the opening time and sends /prelaunch home", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_OPEN_AT", OPEN_ISO);
    expect(prelaunchGateResponse(request("/"), OPEN)).toBeNull();
    expect(prelaunchGateResponse(request("/prelaunch"), OPEN)?.headers.get("location")).toBe("http://127.0.0.1:3000/");
  });
});
