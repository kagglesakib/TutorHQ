/**
 * Ensures the batch string is formatted consistently with "HSC YYYY" prefix.
 * Normalizes 2-digit years to 4-digit (e.g. "26" → "HSC 2026", "HSC 26" → "HSC 2026", "2028" → "HSC 2028").
 */
export const formatBatch = (batch: string | undefined | null, fallback = 'N/A'): string => {
  if (!batch || batch.trim() === '') return fallback;
  const trimmed = batch.trim();

  // Match 2-digit or 4-digit numbers with optional "HSC" prefix
  const match = trimmed.match(/^(?:HSC\s*)?(\d{2}|\d{4})$/i);
  if (match) {
    const num = parseInt(match[1], 10);
    const fullYear = num < 100 ? 2000 + num : num;
    return `HSC ${fullYear}`;
  }

  if (trimmed.toUpperCase().startsWith('HSC')) return trimmed;
  return `HSC ${trimmed}`;
};
