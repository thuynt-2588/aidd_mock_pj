import Image from "next/image";

// 3 Keyvisual: Figma node 2167:5138 exported as is (1440x547), placed right
// under the 80px header, plus the Cover gradient over the top 627px
// (0deg #00101A -4.23% → transparent 52.79%).
// Decorative only, so it is hidden from assistive tech.
export function AwardsKeyvisual() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[627px] overflow-hidden">
      <div className="absolute inset-x-0 top-20 h-[547px]">
        <Image src="/awards/keyvisual-2025.jpg" alt="" fill priority sizes="100vw" className="object-cover object-center" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(0deg,#00101a_-4.23%,rgba(0,19,32,0)_52.79%)]" />
    </div>
  );
}
