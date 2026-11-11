import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";

import { getLocale } from "@/lib/i18n/get-locale";
import { getPrelaunchMessages } from "@/lib/i18n/prelaunch-messages";
import { PrelaunchCountdown } from "./_components/prelaunch-countdown";

export const metadata: Metadata = {
  title: "SAA 2025 - Countdown",
};

// Countdown - Prelaunch page (MoMorph 8PJQswPZmU, Figma 2268:35127, 1512x1077).
// Public: no header/footer, nothing to navigate to until the countdown ends.
async function PrelaunchScreen() {
  const t = getPrelaunchMessages(await getLocale());

  return (
    // Figma: the 264px content block starts at y=314 in the 1077 frame, i.e.
    // 92px above centre → extra 184px bottom padding (96 + 184 = 280).
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-saa-bg px-6 pb-[280px] pt-24 lg:px-36">
      {/* 0.1 Background image (cover, no-repeat) + Cover gradient (18deg). */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* Export of node 2268:35129 as cropped in Figma (1512x1077). */}
        <Image src="/prelaunch/bg.png" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(18deg,#00101a_15.48%,rgba(0,18,29,0.46)_52.13%,rgba(0,19,32,0)_63.41%)]" />
      </div>

      <div className="relative flex flex-col items-center gap-6">
        {/* 0.2 Title */}
        <h1 className="text-center text-4xl font-bold leading-12 text-saa-text">{t.title}</h1>
        <PrelaunchCountdown units={t.units} />
      </div>
    </main>
  );
}

export default function PrelaunchPage() {
  return (
    <Suspense fallback={null}>
      <PrelaunchScreen />
    </Suspense>
  );
}
