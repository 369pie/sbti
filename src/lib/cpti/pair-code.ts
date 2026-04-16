// Pair code generation — alphanumeric, avoids ambiguous chars (0/O, 1/I/L)
// Uses: 2-9 + A-H + J-K + M-N + P-Z = 32 chars
// 6 chars = ~30 bits entropy (vs 20 bits for 6 digits)
const CODE_CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export function generatePairCode(length = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

// Normalize input: uppercase, strip ambiguous chars interpretation
export function normalizePairCode(input: string): string {
  return input.toUpperCase().replace(/\s/g, '');
}

// Validate format: 6 alphanumeric chars (case-insensitive)
export function isValidPairCodeFormat(code: string): boolean {
  return /^[2-9A-HJKMNP-Z]{6}$/i.test(code);
}
