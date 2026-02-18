/**
 * Splits an input string into word-like segments.
 *
 * The function attempts to be Unicode-aware and supports the following
 * heuristics for identifying boundaries:
 * - Splits on any run of non-letter/number characters (spaces, punctuation).
 * - Inserts boundaries for camelCase (e.g. `myTask` -> `my Task`).
 * - Inserts a boundary between an ALL-CAPS acronym and a following
 *   capitalized word (e.g. `HTTPServer` -> `HTTP Server`).
 *
 * Returned words are trimmed and empty segments are discarded.
 *
 * @example
 * splitWords("myTask") // => ["my", "Task"]
 * splitWords("HTTPServer") // => ["HTTP", "Server"]
 * splitWords("Título grande") // => ["Título", "grande"]
 *
 * @param input - The string to split into words.
 * @returns An array of word segments (possibly empty).
 */
export function splitWords(input: string): string[] {
  const cleaned = input.trim();
  if (!cleaned) return [];

  const withBoundaries = cleaned
    // camelCase boundary: myTask -> my Task
    .replace(/(\p{Ll}|\p{N})(\p{Lu})/gu, "$1 $2")
    // ALLCAPS followed by lowercase: HTTPServer -> HTTP Server
    .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, "$1 $2");

  return withBoundaries
    .split(/[^\p{L}\p{N}]+/u)
    .map((w) => w.trim())
    .filter(Boolean);
}

/**
 * Upper-cases the first character of the provided string.
 *
 * Does not modify the remainder of the string.
 *
 * @example
 * upperFirst("hello") // => "Hello"
 * upperFirst("") // => ""
 *
 * @param s - Input string.
 * @returns String with the first character upper-cased (if present).
 */
export function upperFirst(s: string) {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

/**
 * Lower-cases the first character of the provided string.
 *
 * Does not modify the remainder of the string.
 *
 * @example
 * lowerFirst("Hello") // => "hello"
 * lowerFirst("") // => ""
 *
 * @param s - Input string.
 * @returns String with the first character lower-cased (if present).
 */
export function lowerFirst(s: string) {
  return s.length ? s[0].toLowerCase() + s.slice(1) : s;
}
