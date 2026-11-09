type LoginFooterProps = { text: string };

// Footer 1440x91, top border #2E3940, Montserrat Alternates 700 / 16px.
export function LoginFooter({ text }: LoginFooterProps) {
  return (
    <footer className="absolute inset-x-0 top-[933px] z-40 flex h-[91px] items-center justify-center border-t border-saa-divider px-[90px]">
      <p className="font-alt text-base font-bold leading-6 text-saa-text">
        {text}
      </p>
    </footer>
  );
}
