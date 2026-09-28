export type ChatSegment = { text: string; bold: boolean };

/** Parse our tiny chat emphasis syntax as text, never as HTML. */
export function formatChatLines(text: string): ChatSegment[][] {
  return text
    .replace(/^\s*[\*\-]\s+/gm, "• ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .split("\n")
    .map((line) => line.split(/(\*\*[^*]+\*\*)/g)
      .filter(Boolean)
      .map((part) => part.startsWith("**") && part.endsWith("**")
        ? { text: part.slice(2, -2), bold: true }
        : { text: part, bold: false }));
}
