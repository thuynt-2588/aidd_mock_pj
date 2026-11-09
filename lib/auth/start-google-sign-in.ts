import { createBrowserSupabaseClient } from "@/lib/supabase/browser-client";

import { AUTH_CALLBACK_PATH, LOGIN_ERROR_PATH } from "./auth-routes";

// Starts the Google PKCE flow from the browser. On success Supabase stores the
// code verifier cookie and navigates the window to its authorize endpoint, so
// this promise resolves just before the page unloads.
// On any failure the user lands on /login with the single generic error flag;
// the provider's error detail is never surfaced in the UI (BR-003).
export async function startGoogleSignIn(): Promise<void> {
  try {
    const { error } = await createBrowserSupabaseClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${AUTH_CALLBACK_PATH}` },
    });
    if (!error) return;
    console.error("Google sign-in could not start:", error.message);
  } catch (cause) {
    console.error("Google sign-in could not start:", cause);
  }
  window.location.assign(LOGIN_ERROR_PATH);
}
