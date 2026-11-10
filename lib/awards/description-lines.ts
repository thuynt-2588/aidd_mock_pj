// Award descriptions follow the Figma text model:
// - "\n" starts a new paragraph; an empty paragraph is a blank line.
// - LINE_SEPARATOR (U+2028, Figma's Shift+Enter) breaks the line inside a
//   paragraph (no blank line in between).
export const LINE_SEPARATOR = " ";

// Returns paragraphs, each a list of lines; [] marks a blank line.
export function splitDescription(text: string): string[][] {
  return text.split("\n").map((paragraph) => (paragraph === "" ? [] : paragraph.split(LINE_SEPARATOR)));
}
