import { Suspense } from "react";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/messages";
import { setLocaleAction } from "@/lib/i18n/set-locale-action";
import { GoogleLoginButton } from "./_components/google-login-button";
import { LanguageSelector } from "./_components/language-selector";
import { LoginErrorAlert } from "./_components/login-error-alert";
import { LoginFooter } from "./_components/login-footer";
import { LoginHeader } from "./_components/login-header";
import { LoginHero } from "./_components/login-hero";
import { LoginIntro } from "./_components/login-intro";

type LoginPageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

// Request-time data (cookie, query) is read inside <Suspense> (cacheComponents).
async function LoginScreen({ searchParams }: LoginPageProps) {
  const [locale, { error }] = await Promise.all([getLocale(), searchParams]);
  const t = getMessages(locale);

  return (
    // Full-bleed: backgrounds span the viewport; content keeps the Figma 144px
    // side offsets. Desktop-only spec, so never narrower than the 1440 frame.
    <main className="relative h-[1024px] w-full min-w-[1440px] overflow-hidden bg-saa-bg">
      <LoginHero titleAlt={t.titleAlt} />
      <div className="absolute left-36 top-[568px] z-20 flex w-[496px] flex-col gap-6 pl-4">
        <LoginIntro line1={t.intro1} line2={t.intro2} />
        <GoogleLoginButton label={t.loginButton} />
      </div>
      <LoginErrorAlert message={error === "auth_failed" ? t.loginError : null} />
      {/* Cover gradient (Figma "Cover"): above content, never intercepts clicks. */}
      <div className="pointer-events-none absolute inset-x-0 top-[138px] z-30 h-[1093px] bg-[linear-gradient(0deg,#00101a_22.48%,rgba(0,19,32,0)_51.74%)]" />
      <LoginHeader
        logoAlt={t.logoAlt}
        languageSelector={
          <LanguageSelector current={locale} onSelect={setLocaleAction} />
        }
      />
      <LoginFooter text={t.footer} />
    </main>
  );
}

export default function LoginPage(props: LoginPageProps) {
  return (
    <Suspense fallback={null}>
      <LoginScreen {...props} />
    </Suspense>
  );
}
