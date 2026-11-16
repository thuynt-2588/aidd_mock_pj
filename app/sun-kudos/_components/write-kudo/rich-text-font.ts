import { Montserrat } from "next/font/google";

// Montserrat as a VARIABLE font, for the "Viết Kudo" editor and rich-text
// cards only (not preloaded). The text is drawn bold with the `wght` axis
// (font-variation-settings, see .kudo-rich in globals.css) while the CSS
// font-weight stays 400: with a bold font-weight the browser's Bold command
// would treat all text as bold already and turn it OFF instead of on.
export const richTextFont = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: "variable",
  preload: false,
});
