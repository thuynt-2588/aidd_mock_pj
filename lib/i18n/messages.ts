import type { Locale } from "./locale-config";

export interface Messages {
  intro1: string;
  intro2: string;
  loginButton: string;
  loginError: string;
  footer: string;
  languageLabel: string;
  logoAlt: string;
  titleAlt: string;
}

const messages: Record<Locale, Messages> = {
  vi: {
    intro1: "Bắt đầu hành trình của bạn cùng SAA 2025.",
    intro2: "Đăng nhập để khám phá!",
    loginButton: "LOGIN With Google",
    loginError: "Đăng nhập không thành công. Vui lòng thử lại.",
    footer: "Bản quyền thuộc về Sun* © 2025",
    languageLabel: "VN",
    logoAlt: "Sun* Annual Awards 2025",
    titleAlt: "ROOT FURTHER",
  },
  en: {
    intro1: "Start your journey with SAA 2025.",
    intro2: "Log in to explore!",
    loginButton: "LOGIN With Google",
    loginError: "Sign-in failed. Please try again.",
    footer: "Copyright by Sun* © 2025",
    languageLabel: "EN",
    logoAlt: "Sun* Annual Awards 2025",
    titleAlt: "ROOT FURTHER",
  },
};

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}
