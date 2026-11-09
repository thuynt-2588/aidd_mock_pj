type LoginErrorAlertProps = { message?: string | null };

// Not part of the Figma frame; the spec only defines the message text, so the
// style is a minimal readable one placed under the Google button.
export function LoginErrorAlert({ message }: LoginErrorAlertProps) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="absolute left-40 top-[748px] z-40 w-[305px] text-base font-bold leading-6 text-[#ffb4ab]"
    >
      {message}
    </p>
  );
}
