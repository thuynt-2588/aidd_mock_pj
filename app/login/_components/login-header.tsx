import Image from "next/image";
import type { ReactNode } from "react";

type LoginHeaderProps = {
  logoAlt: string;
  languageSelector: ReactNode;
};

// Header 1440x80, padding 12/144, translucent bar (Figma mms_A_Header).
export function LoginHeader({ logoAlt, languageSelector }: LoginHeaderProps) {
  return (
    <header className="absolute inset-x-0 top-0 z-50 flex h-20 items-center justify-between bg-saa-header px-36 py-3">
      <Image
        src="/login/logo.png"
        alt={logoAlt}
        width={52}
        height={48}
        className="h-12 w-[52px]"
        priority
      />
      {languageSelector}
    </header>
  );
}
