import Image from "next/image";

type LoginHeroProps = { titleAlt: string };

// Key visual (Figma "image 1"), left fade (Rectangle 57) and the ROOT FURTHER
// title art. The exported key visual is already cropped to the frame, so it
// simply covers the full-width hero box (no Figma crop offsets re-applied).
export function LoginHero({ titleAlt }: LoginHeroProps) {
  return (
    <>
      <div className="absolute inset-x-0 top-0.5 h-[1022px] overflow-hidden">
        <Image
          src="/login/keyvisual.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-right-top"
        />
      </div>
      <div className="absolute inset-x-0 top-0 z-10 h-[1024px] bg-[linear-gradient(90deg,#00101a_0%,#00101a_25.41%,rgba(0,16,26,0)_100%)]" />
      <Image
        src="/login/root-further-title12.png"
        alt={titleAlt}
        width={451}
        height={200}
        priority
        className="absolute left-36 top-[288px] z-20 h-[200px] w-[451px]"
      />
    </>
  );
}
