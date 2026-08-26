/**
 * Splits medical and scientific abstract text into individual sentences,
 * preserving abbreviations, numerical ranges, citations, and decimals.
 */
export function splitAbstractIntoSentences(text: string): string[] {
  if (!text || typeof text !== 'string') return [];

  // Clean and normalize whitespace
  const normalized = text.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // If the user already pasted line-by-line sentences
  const rawLines = normalized.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (rawLines.length > 1 && rawLines.every(l => l.endsWith('.') || l.endsWith(':') || l.length > 30)) {
    return rawLines;
  }

  // Regex-based medical sentence tokenizer
  // Protect common abbreviations before splitting
  const protectedText = normalized
    .replace(/\b(e\.g\.|i\.e\.|et al\.|vs\.|fig\.|tab\.|approx\.|dr\.|prof\.|mr\.|mrs\.|ms\.|no\.|vol\.|pp\.)/gi, (match) => {
      return match.replace(/\./g, '__DOT__');
    })
    // Protect decimal numbers like 0.05, 95.5%, etc.
    .replace(/(\d)\.(\d)/g, '$1__DOT__$2');

  // Split on sentence boundaries: (. ! ?) followed by whitespace and a capital letter/quote/number
  const rawSentences = protectedText.split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/g);

  const sentences = rawSentences
    .map(s => s.replace(/__DOT__/g, '.').trim())
    .filter(s => s.length > 0);

  return sentences.length > 0 ? sentences : [normalized];
}
