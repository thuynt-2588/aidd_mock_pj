// Public Supabase settings shared by the browser and server clients.
// Each variable is read with a literal `process.env.NEXT_PUBLIC_*` access so
// Next.js can inline it into the client bundle; dynamic lookups would not be.
// Only the public URL and the anon key live here: never a service/secret key.

export type SupabaseEnv = {
  url: string;
  anonKey: string;
};

export function getSupabaseEnv(): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    );
  }

  return { url, anonKey };
}
