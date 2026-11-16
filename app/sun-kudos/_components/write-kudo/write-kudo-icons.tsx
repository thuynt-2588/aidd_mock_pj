// Inline 24px icons for the "Viết Kudo" dialog (Figma MM_MEDIA_Bold / Italic /
// Strikethrough / Number List / Link / Quote / Plus / Close / Send / Check).
// Drawn with currentColor so the parent sets the colour.

type IconProps = { className?: string };

function Svg({ className = "size-6", children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
      {children}
    </svg>
  );
}

export const BoldIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z" strokeWidth={2.6} />
  </Svg>
);

export const ItalicIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 5h8M6 19h8M14.5 5 9.5 19" strokeWidth={2.4} />
  </Svg>
);

export const StrikeIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 12h16M16.5 7.5C16 5.9 14.3 5 12 5c-2.8 0-4.5 1.3-4.5 3.2 0 1.2.7 2.1 2 2.8M8 16.3c.6 1.7 2.2 2.7 4.3 2.7 2.8 0 4.7-1.3 4.7-3.4 0-.7-.2-1.3-.6-1.8" />
  </Svg>
);

export const NumberListIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 6h10M10 12h10M10 18h10" />
    <path d="M4 4.5 5 4v4M3.8 10.6c.3-.5.8-.7 1.3-.6.6.1.9.6.7 1.1L4 13.5h2M4 16.2h2l-1 1.3c.7 0 1.1.4 1.1.9s-.5 1-1.1 1c-.5 0-.9-.2-1.1-.5" strokeWidth={1.4} />
  </Svg>
);

export const LinkToolIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2" />
    <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2" />
  </Svg>
);

export const QuoteIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 7h4v4.5c0 2.5-1.2 4.2-3.5 5M14 7h4v4.5c0 2.5-1.2 4.2-3.5 5" strokeWidth={2.4} />
  </Svg>
);

export const PlusIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 4v16M4 12h16" strokeWidth={1.6} />
  </Svg>
);

export const CloseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const SendPlaneIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 5.5 20 12 4 18.5 6.5 12zM6.5 12H12" />
  </Svg>
);

export const CheckCircleIcon = (p: IconProps) => (
  <svg aria-hidden viewBox="0 0 24 24" className={`shrink-0 ${p.className ?? "size-6"}`}>
    <circle cx="12" cy="12" r="9" fill="currentColor" />
    <path d="m8 12.2 2.7 2.6L16 9.5" fill="none" stroke="#00101a" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CaretDownIcon = (p: IconProps) => (
  <svg aria-hidden viewBox="0 0 24 24" className={`shrink-0 ${p.className ?? "size-6"}`}>
    <path d="M7 10h10l-5 5z" fill="currentColor" />
  </svg>
);
