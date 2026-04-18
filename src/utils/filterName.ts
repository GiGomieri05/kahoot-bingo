import { normalizeLeet, BADWORDS } from './badwords';

/**
 * Returns true if the name contains a bad word.
 * Normalizes the input for leet-speak and special characters.
 */
export function containsBadWord(name: string): boolean {
  const normalized = normalizeLeet(name);
  return BADWORDS.some((word) => normalized.includes(word));
}
