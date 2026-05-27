/**
 * LumenPass Cryptographic Core Module
 * 
 * This module is responsible for secure, client-side, zero-knowledge cryptographic
 * operations. It uses the browser's native Web Crypto API for maximum performance,
 * memory safety, and security.
 * 
 * Philosophy: Zero-Knowledge. Decrypted data and master passwords NEVER leave
 * the client browser context.
 * 
 * Standards:
 * - Key Derivation: PBKDF2 with HMAC-SHA-256 and 600,000 iterations (OWASP recommendation).
 * - Symmetric Encryption: AES-256-GCM.
 * - Format: Encrypted strings are returned as a unified Base64 bundle containing
 *   the 12-byte random IV prepended to the actual ciphertext:
 *   [ 12 bytes IV ] + [ Ciphertext bytes ] -> Base64
 * 
 * @license GPLv3
 */

const getCrypto = (): Crypto => {
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto;
  }
  throw new Error('Web Crypto API is not available in this environment.');
};

/**
 * Converts a UTF-8 string to a Uint8Array.
 */
export function stringToBuffer(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Converts an ArrayBuffer/Uint8Array to a UTF-8 string.
 */
export function bufferToString(buf: ArrayBuffer | Uint8Array): string {
  return new TextDecoder().decode(buf);
}

/**
 * Encodes an ArrayBuffer or Uint8Array as a Base64 string.
 * Native implementation that works across both Browser and Node.js runtimes.
 */
export function bufferToBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decodes a Base64 string into a Uint8Array.
 */
export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generates a cryptographically secure random salt encoded in Base64.
 * 
 * @param bytes The size of the salt in bytes (default: 16 bytes/128-bit entropy).
 * @returns A base64-encoded string representing the salt.
 */
export function generateRandomSalt(bytes: number = 16): string {
  const cryptoObj = getCrypto();
  const saltArray = cryptoObj.getRandomValues(new Uint8Array(bytes));
  return bufferToBase64(saltArray);
}

/**
 * Derives an AES-256-GCM symmetric encryption key from a master password and a salt
 * using the PBKDF2 key derivation algorithm.
 * 
 * Security Features:
 * - Uses HMAC-SHA-256 as the PRF (Pseudo-Random Function).
 * - Executes 600,000 iterations to protect against offline GPU/ASIC brute-force attacks.
 * - The derived key is marked as NON-EXTRACTABLE (`extractable: false`) to prevent in-memory
 *   extraction attacks in the browser.
 * 
 * @param password The raw master password.
 * @param salt The unique cryptographic salt (Base64 string).
 * @returns A promise resolving to a secure, non-extractable CryptoKey.
 */
export async function deriveKeyFromPassword(
  password: string,
  salt: string
): Promise<CryptoKey> {
  const cryptoObj = getCrypto();
  const subtle = cryptoObj.subtle;

  const passwordBytes = stringToBuffer(password);
  
  // Try to decode salt from Base64, fallback to direct UTF-8 if invalid Base64
  let saltBytes: Uint8Array;
  try {
    saltBytes = base64ToBuffer(salt);
    // Extra safety: check if base64 decoding yielded zero bytes
    if (saltBytes.length === 0) {
      saltBytes = stringToBuffer(salt);
    }
  } catch {
    saltBytes = stringToBuffer(salt);
  }

  // Import the password as a raw key material for PBKDF2
  const keyMaterial = await subtle.importKey(
    'raw',
    passwordBytes as BufferSource,
    { name: 'PBKDF2' },
    false, // raw password key is not extractable
    ['deriveKey']
  );

  // Derive the actual AES-256-GCM symmetric key
  return subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes as BufferSource,
      iterations: 600000,
      hash: 'SHA-256'
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256
    },
    false, // The derived key is marked non-extractable in-memory for security
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a plaintext UTF-8 string using AES-256-GCM.
 * 
 * Security Features:
 * - Automatically generates a cryptographically secure 12-byte (96-bit) IV for each execution.
 * - Uses 128-bit integrity tag length to guarantee Authenticated Encryption (AEAD).
 * - Serializes the result by prepending the 12-byte IV directly to the ciphertext before Base64 encoding.
 * 
 * @param plainText The UTF-8 plain string to encrypt.
 * @param key The Derived AES-GCM CryptoKey.
 * @returns A promise resolving to a combined Base64 ciphertext representation (IV + ciphertext).
 */
export async function encryptData(
  plainText: string,
  key: CryptoKey
): Promise<string> {
  const cryptoObj = getCrypto();
  const subtle = cryptoObj.subtle;

  // 1. Generate a secure, unique 12-byte IV (Initialization Vector)
  const iv = cryptoObj.getRandomValues(new Uint8Array(12));

  // 2. Convert UTF-8 plaintext to byte buffer
  const plainTextBytes = stringToBuffer(plainText);

  // 3. Perform AES-256-GCM encryption
  const encryptedBuffer = await subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
      tagLength: 128 // 128-bit authentication tag
    },
    key,
    plainTextBytes as BufferSource
  );

  const encryptedBytes = new Uint8Array(encryptedBuffer);

  // 4. Prepend the 12-byte IV to the ciphertext bytes
  const combined = new Uint8Array(iv.length + encryptedBytes.length);
  combined.set(iv, 0);
  combined.set(encryptedBytes, iv.length);

  // 5. Return the result as a Base64 string
  return bufferToBase64(combined);
}

/**
 * Decrypts a combined Base64 ciphertext (IV + ciphertext) using AES-256-GCM.
 * 
 * Security Features:
 * - Extracts the unique 12-byte IV from the start of the array.
 * - Validates the AEAD authentication tag during decryption. Any unauthorized manipulation 
 *   or corruption will result in a standard cryptographic decryption error.
 * 
 * @param cipherText The combined Base64 ciphertext string.
 * @param key The Derived AES-GCM CryptoKey.
 * @returns A promise resolving to the decrypted plain UTF-8 string.
 */
export async function decryptData(
  cipherText: string,
  key: CryptoKey
): Promise<string> {
  const cryptoObj = getCrypto();
  const subtle = cryptoObj.subtle;

  // 1. Decode the Base64 input
  const combined = base64ToBuffer(cipherText);

  // Validation: AES-GCM requires a 12-byte IV + at least 16-byte auth tag
  if (combined.length < 12 + 16) {
    throw new Error('Ciphertext is corrupted or too short.');
  }

  // 2. Separate IV (first 12 bytes) and the encrypted payload
  const iv = combined.slice(0, 12);
  const encryptedPayload = combined.slice(12);

  // 3. Perform AES-256-GCM decryption and integrity verification
  const decryptedBuffer = await subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
      tagLength: 128
    },
    key,
    encryptedPayload as BufferSource
  );

  // 4. Return decrypted bytes as a UTF-8 string
  return bufferToString(decryptedBuffer);
}
