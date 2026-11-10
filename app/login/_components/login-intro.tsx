type LoginIntroProps = { line1: string; line2: string };

// Intro copy: Montserrat 700 / 20px / 40px line height / 0.5px tracking.
export function LoginIntro({ line1, line2 }: LoginIntroProps) {
  return (
    <div className="w-[480px] text-xl font-bold leading-10 tracking-[0.5px] text-saa-text">
      <p>{line1}</p>
      <p>{line2}</p>
    </div>
  );
}
