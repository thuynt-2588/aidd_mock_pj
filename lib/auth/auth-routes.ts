// Fixed paths of the Google sign-in flow, shared by the OAuth start helper,
// the /auth/callback route and the /login page.
// Redirect targets are constants on purpose: never take them from the query
// string (open-redirect risk).

export const LOGIN_PATH = "/login";
export const AUTH_CALLBACK_PATH = "/auth/callback";
export const POST_LOGIN_PATH = "/todo";

// Query flag carried back to /login on any sign-in failure. Every cause
// (cancelled, denied, exchange error, start error) uses this one value (BR-003).
export const LOGIN_ERROR_PARAM = "error";
export const LOGIN_ERROR_FLAG = "auth_failed";
export const LOGIN_ERROR_PATH = `${LOGIN_PATH}?${LOGIN_ERROR_PARAM}=${LOGIN_ERROR_FLAG}`;
