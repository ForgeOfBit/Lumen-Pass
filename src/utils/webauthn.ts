/**
 * WebAuthn / Passkey utilities for LumenPass.
 * Uses the browser's native Credential Management API (navigator.credentials).
 * Zero-Knowledge: private keys never leave the authenticator.
 */

const RP_ID   = window.location.hostname || 'localhost';
const RP_NAME = 'LumenPass';

function bufToB64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = '';
  bytes.forEach(b => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function b64urlToBuf(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(b64);
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
  return buf;
}

export interface PasskeyRegistrationResult {
  credentialId: string;    // base64url
  userHandle: string;      // base64url
  rpId: string;
  rpName: string;
  passkeyUsername: string;
  publicKeyAlgorithm: number;
  transports: string[];
  createdAt: string;
}

/**
 * Register a new passkey via WebAuthn navigator.credentials.create().
 * Prompts the user's platform authenticator (Face ID, Touch ID, Windows Hello, etc.)
 */
export async function registerPasskey(
  displayName: string,
  username: string
): Promise<PasskeyRegistrationResult> {
  if (!navigator.credentials || !window.PublicKeyCredential) {
    throw new Error('Bu tarayıcı WebAuthn / Passkey desteklemiyor.');
  }

  const userHandle = crypto.getRandomValues(new Uint8Array(16));
  const challenge  = crypto.getRandomValues(new Uint8Array(32));

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { id: RP_ID, name: RP_NAME },
      user: {
        id: userHandle,
        name: username,
        displayName: displayName,
      },
      pubKeyCredParams: [
        { alg: -7,   type: 'public-key' }, // ES256 (preferred)
        { alg: -257, type: 'public-key' }, // RS256 (fallback)
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'required',
        userVerification: 'required',
      },
      timeout: 60_000,
      attestation: 'none',
    },
  }) as PublicKeyCredential | null;

  if (!credential) throw new Error('Passkey kaydı iptal edildi.');

  const response = credential.response as AuthenticatorAttestationResponse;
  const transports = response.getTransports?.() ?? [];
  const alg = parseAlgFromAttestation(response.attestationObject);

  return {
    credentialId:        bufToB64url(credential.rawId),
    userHandle:          bufToB64url(userHandle),
    rpId:                RP_ID,
    rpName:              RP_NAME,
    passkeyUsername:     username,
    publicKeyAlgorithm:  alg,
    transports,
    createdAt:           new Date().toISOString(),
  };
}

/**
 * Authenticate with a stored passkey via WebAuthn navigator.credentials.get().
 */
export async function authenticatePasskey(credentialId: string): Promise<boolean> {
  if (!navigator.credentials || !window.PublicKeyCredential) {
    throw new Error('Bu tarayıcı WebAuthn / Passkey desteklemiyor.');
  }

  const challenge = crypto.getRandomValues(new Uint8Array(32));

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      rpId: RP_ID,
      allowCredentials: [{
        id: b64urlToBuf(credentialId) as BufferSource,
        type: 'public-key',
      }],
      userVerification: 'required',
      timeout: 60_000,
    },
  }) as PublicKeyCredential | null;

  return !!assertion;
}

/** Try to parse the algorithm from the attestation CBOR (simplified heuristic) */
function parseAlgFromAttestation(attestationObject: ArrayBuffer): number {
  try {
    // CBOR parsing is complex; we detect common cases from bytes
    const bytes = new Uint8Array(attestationObject);
    // ES256 signature uses algorithm -7; RS256 uses -257
    // Look for 0x26 (ES256 = -7 in CBOR int) in first 200 bytes
    for (let i = 0; i < Math.min(200, bytes.length); i++) {
      if (bytes[i] === 0x26) return -7; // ES256
    }
    return -257; // RS256 fallback
  } catch {
    return -7;
  }
}

export function algName(alg: number): string {
  if (alg === -7)   return 'ES256 (P-256)';
  if (alg === -257) return 'RS256 (RSA-2048)';
  return `Algoritma ${alg}`;
}

export function transportLabel(t: string): string {
  const map: Record<string, string> = {
    internal: 'Dahili (Touch/Face ID)',
    usb:      'USB Güvenlik Anahtarı',
    nfc:      'NFC',
    ble:      'Bluetooth',
    hybrid:   'Hybrid / QR',
  };
  return map[t] ?? t;
}
