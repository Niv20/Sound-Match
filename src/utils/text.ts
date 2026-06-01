/** הסרת ניקוד וטעמים (U+0591–U+05C7). */
export function stripNikud(s: string): string {
  return s.normalize('NFC').replace(/[֑-ׇ]/g, '');
}
