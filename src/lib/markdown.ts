import DOMPurify from 'dompurify';
import { marked } from 'marked';

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Rend du Markdown en HTML assaini. `marked` ne nettoie pas le HTML : la sortie
 * passe toujours par DOMPurify avant d'atteindre `dangerouslySetInnerHTML`.
 * Les attributs `style` sont retirés (la CSP les bloquerait de toute façon).
 */
export function renderMarkdown(md: string): string {
  let raw: string;
  try {
    raw = marked.parse(md) as string;
  } catch (e) {
    return `<p class="text-red-400">Erreur de rendu : ${escapeHtml((e as Error).message)}</p>`;
  }
  return DOMPurify.sanitize(raw, { FORBID_ATTR: ['style'], FORBID_TAGS: ['style'] });
}
