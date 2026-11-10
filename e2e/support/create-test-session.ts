import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { createServerClient } from "@supabase/ssr";
import type { BrowserContext } from "@playwright/test";

// Signs a throwaway user up against the LOCAL Supabase (signup on, email
// confirmation off in supabase/config.toml) and copies the session cookies the
// @supabase/ssr library writes into the Playwright browser context.
// Only the public anon key is used; no service_role key, nothing on disk.

const HOST = "127.0.0.1";

function readPublicEnv() {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  }
  return { url, anonKey };
}

export async function signInAsNewTestUser(context: BrowserContext): Promise<string> {
  const { url, anonKey } = readPublicEnv();
  const jar = new Map<string, string>();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: (cookies) => {
        for (const { name, value } of cookies) {
          if (value) jar.set(name, value);
          else jar.delete(name);
        }
      },
    },
  });

  const email = `e2e-${randomUUID()}@example.test`;
  const { error } = await supabase.auth.signUp({ email, password: `Pw-${randomUUID()}` });
  if (error) throw new Error(`Test sign-up failed: ${error.message}`);
  if (jar.size === 0) throw new Error("Sign-up returned no session cookies");

  await context.addCookies(
    [...jar].map(([name, value]) => ({ name, value, domain: HOST, path: "/", sameSite: "Lax" as const })),
  );
  return email;
}
