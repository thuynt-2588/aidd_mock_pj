import localFont from "next/font/local";

// Figma uses "Digital Numbers" for the countdown digits; no licensed file is
// available, so DSEG7 Classic (npm `dseg`, OFL-1.1) stands in: same 7-segment
// LCD look, self-hosted by next/font.
export const countdownDigitFont = localFont({
  src: "../../../node_modules/dseg/fonts/DSEG7-Classic/DSEG7Classic-Regular.woff2",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});
