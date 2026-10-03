// Base64 sur du texte UTF-8, standard ou URL-safe (RFC 4648 §5).

const CHUNK = 0x8000;

function bytesToBinary(bytes: Uint8Array): string {
  // Par blocs : String.fromCharCode(...bytes) dépasse la pile sur de gros volumes.
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return binary;
}

export function encodeBase64(text: string, opts: { urlSafe?: boolean } = {}): string {
  const b64 = btoa(bytesToBinary(new TextEncoder().encode(text)));
  if (!opts.urlSafe) return b64;
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Décode du Base64 standard ou URL-safe, avec ou sans padding, en ignorant les
 * espaces et retours à la ligne (MIME, PEM). Lève une erreur si la chaîne est
 * invalide ou si les octets ne forment pas de l'UTF-8 valide.
 */
export function decodeBase64(input: string): string {
  let b64 = input.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(b64)) throw new Error('Base64 invalide');
  b64 = b64.replace(/=+$/, '');
  if (b64.length % 4 === 1) throw new Error('Base64 invalide');
  b64 += '='.repeat((4 - (b64.length % 4)) % 4);

  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new Error("Les octets décodés ne forment pas de l'UTF-8 valide (donnée binaire ?)");
  }
}
