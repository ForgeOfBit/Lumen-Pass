/**
 * Card brand detection and visual components for LumenPass.
 * Supports: Visa, Mastercard, Amex, Discover, Troy, UnionPay, JCB, Mir, Maestro
 */

export type CardBrand =
  | 'visa' | 'mastercard' | 'amex' | 'discover'
  | 'troy' | 'unionpay' | 'jcb' | 'mir' | 'maestro' | 'unknown';

/** Detect card brand from card number prefix */
export function detectCardBrand(number: string): CardBrand {
  const n = number.replace(/\s/g, '');
  if (!n) return 'unknown';

  // Troy — Turkish domestic (must check before Visa/MC as Troy can start with 9792)
  if (/^9792/.test(n)) return 'troy';

  // Amex
  if (/^3[47]/.test(n)) return 'amex';

  // Discover
  if (/^(6011|622(12[6-9]|1[3-9]\d|[2-8]\d{2}|9[01]\d|92[0-5])|64[4-9]|65)/.test(n)) return 'discover';

  // UnionPay (62xx but not Discover range)
  if (/^62/.test(n)) return 'unionpay';

  // Mastercard (51–55 and 2221–2720)
  if (/^5[1-5]/.test(n)) return 'mastercard';
  if (/^2(2[2-9]\d|[3-6]\d{2}|7[01]\d|720)/.test(n)) return 'mastercard';

  // Visa
  if (/^4/.test(n)) return 'visa';

  // JCB
  if (/^35(2[89]|[3-8]\d)/.test(n)) return 'jcb';

  // Mir
  if (/^220[0-4]/.test(n)) return 'mir';

  // Maestro
  if (/^(5018|5020|5038|5893|6304|6759|676[1-3])/.test(n)) return 'maestro';

  return 'unknown';
}

/** Card brand metadata */
export const BRAND_META: Record<CardBrand, {
  label: string;
  logo: string | null;   // path in /brands/
  gradient: string;
  numberFormat: number[]; // digit groups
  cvvLength: number;
  numberLength: number;
}> = {
  visa: {
    label: 'VISA',
    logo: '/brands/visa.png',
    gradient: 'linear-gradient(135deg, #0a0a2e 0%, #1a1a6e 60%, #0e3a8c 100%)',
    numberFormat: [4, 4, 4, 4],
    cvvLength: 3,
    numberLength: 16,
  },
  mastercard: {
    label: 'MASTERCARD',
    logo: '/brands/mastercard.png',
    gradient: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 60%, #1a0a00 100%)',
    numberFormat: [4, 4, 4, 4],
    cvvLength: 3,
    numberLength: 16,
  },
  amex: {
    label: 'AMERICAN EXPRESS',
    logo: '/brands/amex.png',
    gradient: 'linear-gradient(135deg, #003087 0%, #006FCF 100%)',
    numberFormat: [4, 6, 5],
    cvvLength: 4,
    numberLength: 15,
  },
  discover: {
    label: 'DISCOVER',
    logo: '/brands/discover.png',
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #2d1a00 100%)',
    numberFormat: [4, 4, 4, 4],
    cvvLength: 3,
    numberLength: 16,
  },
  troy: {
    label: 'TROY',
    logo: '/brands/troy.png',
    gradient: 'linear-gradient(135deg, #6b0000 0%, #cc0000 60%, #8b0000 100%)',
    numberFormat: [4, 4, 4, 4],
    cvvLength: 3,
    numberLength: 16,
  },
  unionpay: {
    label: 'UNIONPAY',
    logo: '/brands/unionpay.png',
    gradient: 'linear-gradient(135deg, #001a5e 0%, #0033a0 50%, #cc0000 100%)',
    numberFormat: [4, 4, 4, 4],
    cvvLength: 3,
    numberLength: 16,
  },
  jcb: {
    label: 'JCB',
    logo: null,
    gradient: 'linear-gradient(135deg, #003087 0%, #009f6b 100%)',
    numberFormat: [4, 4, 4, 4],
    cvvLength: 3,
    numberLength: 16,
  },
  mir: {
    label: 'МИР',
    logo: null,
    gradient: 'linear-gradient(135deg, #003087 0%, #00a651 100%)',
    numberFormat: [4, 4, 4, 4],
    cvvLength: 3,
    numberLength: 16,
  },
  maestro: {
    label: 'MAESTRO',
    logo: null,
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)',
    numberFormat: [4, 4, 4, 4],
    cvvLength: 3,
    numberLength: 16,
  },
  unknown: {
    label: 'CARD',
    logo: null,
    gradient: 'linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%)',
    numberFormat: [4, 4, 4, 4],
    cvvLength: 3,
    numberLength: 16,
  },
};

/** Format a raw number string according to brand groups */
export function formatCardNumber(raw: string, brand: CardBrand): string {
  const digits = raw.replace(/\D/g, '');
  const groups = BRAND_META[brand].numberFormat;
  let result = '';
  let pos = 0;
  for (const len of groups) {
    if (pos >= digits.length) break;
    if (pos > 0) result += ' ';
    result += digits.slice(pos, pos + len);
    pos += len;
  }
  return result;
}

/** Mask a card number for display (show only last 4) */
export function maskCardNumber(raw: string, brand: CardBrand): string {
  const digits = raw.replace(/\D/g, '');
  const groups = BRAND_META[brand].numberFormat;
  const last4 = digits.slice(-4);
  const masked = groups
    .map((len, i) => (i === groups.length - 1 ? last4 : '•'.repeat(len)))
    .join(' ');
  return masked;
}
