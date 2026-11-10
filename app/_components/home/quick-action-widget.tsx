import Image from "next/image";

type QuickActionWidgetProps = { label: string };

// 6: floating yellow pill 106x64 (radius 100, padding 16, gap 8, glow),
// pinned bottom-right. Display only — the quick-action menu is out of scope.
export function QuickActionWidget({ label }: QuickActionWidgetProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className="fixed bottom-6 right-[19px] z-40 flex h-16 items-center gap-2 rounded-full bg-saa-accent p-4 text-2xl font-bold leading-8 text-saa-bg shadow-saa-glow transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saa-accent"
    >
      <Image src="/home/icon-pencil.svg" alt="" width={24} height={24} className="size-6" />
      <span aria-hidden>/</span>
      <Image src="/home/icon-saa.svg" alt="" width={24} height={24} className="size-6" />
    </button>
  );
}
