import { marked } from 'marked';

export function renderMarkdown(md: string): string {
  try {
    return marked.parse(md) as string;
  } catch (e) {
    return `<p style="color:#f87171;">Erreur de rendu : ${(e as Error).message}</p>`;
  }
}
