// Base64 sur du texte UTF-8 (comportement d'origine, avant correctifs).

export function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  const binary = Array.from(bytes)
    .map((b) => String.fromCharCode(b))
    .join('');
  return btoa(binary);
}

export function decodeBase64(input: string): string {
  const binary = atob(input.trim());
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
