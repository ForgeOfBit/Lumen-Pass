/**
 * TOTP Utility using Web Crypto API
 */

const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32ToUint8Array(base32: string): Uint8Array {
  const cleanBase32 = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  let index = 0;
  const result = new Uint8Array(Math.ceil((cleanBase32.length * 5) / 8));

  for (let i = 0; i < cleanBase32.length; i++) {
    value = (value << 5) | base32chars.indexOf(cleanBase32[i]);
    bits += 5;
    if (bits >= 8) {
      result[index++] = (value >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }
  return result.slice(0, index);
}

export async function generateTOTP(secret: string, offsetPeriods = 0): Promise<{ code: string; progress: number; remainingSeconds: number }> {
  try {
    if (!secret) return { code: '------', progress: 0, remainingSeconds: 0 };
    
    const keyBytes = base32ToUint8Array(secret);
    if (keyBytes.length === 0) return { code: 'HATA', progress: 0, remainingSeconds: 0 };

    const key = await window.crypto.subtle.importKey(
      'raw',
      keyBytes.buffer as BufferSource,
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );

    const period = 30;
    const epochSeconds = Math.floor(Date.now() / 1000);
    const counter = Math.floor(epochSeconds / period) + offsetPeriods;
    const remainingSeconds = period - (epochSeconds % period);
    const progress = (remainingSeconds / period) * 100;

    // Convert counter to 8-byte buffer
    const counterBuffer = new ArrayBuffer(8);
    const counterView = new DataView(counterBuffer);
    counterView.setUint32(4, counter, false); // Big-endian

    const signature = await window.crypto.subtle.sign('HMAC', key, counterBuffer);
    const hmacResult = new Uint8Array(signature);

    const offset = hmacResult[hmacResult.length - 1] & 0xf;
    const codeNum = (
      ((hmacResult[offset] & 0x7f) << 24) |
      ((hmacResult[offset + 1] & 0xff) << 16) |
      ((hmacResult[offset + 2] & 0xff) << 8) |
      (hmacResult[offset + 3] & 0xff)
    ) % 1000000;

    const code = codeNum.toString().padStart(6, '0');
    return { code, progress, remainingSeconds };
  } catch (err) {
    console.error('TOTP generation failed:', err);
    return { code: 'HATA', progress: 0, remainingSeconds: 0 };
  }
}
