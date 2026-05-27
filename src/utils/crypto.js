/**
 * LumenPass Cryptographic Core Module (ES6 Module)
 * 
 * Standardized client-side, zero-knowledge cryptographic operations using Web Crypto.
 * 
 * @license GPLv3
 */

const getCrypto = () => {
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto;
  }
  throw new Error('Web Crypto API is not available in this environment.');
};

export function stringToBuffer(str) {
  return new TextEncoder().encode(str);
}

export function bufferToString(buf) {
  return new TextDecoder().decode(buf);
}

export function bufferToBase64(buf) {
  const bytes = new Uint8Array(buf);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBuffer(base64) {
  const binary = atob(base64.trim());
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function generateRandomSalt(bytes = 16) {
  const cryptoObj = getCrypto();
  const saltArray = cryptoObj.getRandomValues(new Uint8Array(bytes));
  return bufferToBase64(saltArray);
}

export async function deriveKeyFromPassword(password, salt) {
  const cryptoObj = getCrypto();
  const subtle = cryptoObj.subtle;

  const passwordBytes = stringToBuffer(password);
  
  let saltBytes;
  try {
    saltBytes = base64ToBuffer(salt);
    if (saltBytes.length === 0) {
      saltBytes = stringToBuffer(salt);
    }
  } catch {
    saltBytes = stringToBuffer(salt);
  }

  const keyMaterial = await subtle.importKey(
    'raw',
    passwordBytes,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 600000,
      hash: 'SHA-256'
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256
    },
    false, // non-extractable in memory
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(plainText, key) {
  const cryptoObj = getCrypto();
  const subtle = cryptoObj.subtle;

  const iv = cryptoObj.getRandomValues(new Uint8Array(12));
  const plainTextBytes = stringToBuffer(plainText);

  const encryptedBuffer = await subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128
    },
    key,
    plainTextBytes
  );

  const encryptedBytes = new Uint8Array(encryptedBuffer);

  const combined = new Uint8Array(iv.length + encryptedBytes.length);
  combined.set(iv, 0);
  combined.set(encryptedBytes, iv.length);

  return bufferToBase64(combined);
}

export async function decryptData(cipherText, key) {
  const cryptoObj = getCrypto();
  const subtle = cryptoObj.subtle;

  const combined = base64ToBuffer(cipherText);

  if (combined.length < 12 + 16) {
    throw new Error('Ciphertext is corrupted or too short.');
  }

  const iv = combined.slice(0, 12);
  const encryptedPayload = combined.slice(12);

  const decryptedBuffer = await subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128
    },
    key,
    encryptedPayload
  );

  return bufferToString(decryptedBuffer);
}
