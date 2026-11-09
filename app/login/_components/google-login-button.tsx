"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { startGoogleSignIn } from "@/lib/auth/start-google-sign-in";

type GoogleLoginButtonProps = { label: string };

// 305x60, #FFEA9E, radius 8, padding 16/24. Hover/focus/loading visuals are not
// defined in Figma; kept subtle (brightness, outline, dimmed + wait cursor).
export function GoogleLoginButton({ label }: GoogleLoginButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const loading = status === "loading";

  // Back navigation restores the page from bfcache with the loading state
  // frozen; reset it.
  useEffect(() => {
    const reset = (event: PageTransitionEvent) => {
      if (event.persisted) setStatus("idle");
    };
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  async function handleClick() {
    if (loading) return;
    setStatus("loading");
    await startGoogleSignIn();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-busy={loading}
      className="flex h-[60px] w-[305px] items-center gap-2 rounded-lg bg-saa-accent px-6 py-4 transition duration-200 hover:brightness-105 hover:shadow-[0_4px_16px_rgba(255,234,158,0.35)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-wait disabled:opacity-70 disabled:hover:shadow-none"
    >
      <span className="w-[225px] text-center text-[22px] font-bold leading-7 text-saa-bg">
        {label}
      </span>
      <Image src="/login/google-icon.svg" alt="" width={24} height={24} className="size-6" />
    </button>
  );
}
