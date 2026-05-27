/**
 * Cryptographically secure password generator utility.
 */
export interface GeneratorOptions {
  length: number;
  upper: boolean;
  lower: boolean;
  nums: boolean;
  syms: boolean;
}

export const DEFAULT_GEN_OPTIONS: GeneratorOptions = {
  length: 20,
  upper: true,
  lower: true,
  nums: true,
  syms: true,
};

export function generateSecurePassword(opts: GeneratorOptions): string {
  const { length, upper, lower, nums, syms } = opts;
  const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const LOWER = 'abcdefghijklmnopqrstuvwxyz';
  const NUMS  = '0123456789';
  const SYMS  = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let pool = '';
  const required: string[] = [];

  const pick = (charset: string) => {
    const idx = crypto.getRandomValues(new Uint32Array(1))[0] % charset.length;
    return charset[idx];
  };

  if (upper) { pool += UPPER; required.push(pick(UPPER)); }
  if (lower) { pool += LOWER; required.push(pick(LOWER)); }
  if (nums)  { pool += NUMS;  required.push(pick(NUMS)); }
  if (syms)  { pool += SYMS;  required.push(pick(SYMS)); }
  if (!pool) return '';

  const remaining = length - required.length;
  const buf = crypto.getRandomValues(new Uint32Array(Math.max(remaining, 0)));
  const chars = [...required, ...Array.from(buf, n => pool[n % pool.length])];

  // Fisher-Yates shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

export function checkPasswordStrength(pass: string): 0 | 1 | 2 | 3 | 4 {
  if (!pass) return 0;
  let score = 0;
  if (pass.length >= 8)  score++;
  if (pass.length >= 14) score++;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
  if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score++;
  return score as 0 | 1 | 2 | 3 | 4;
}
