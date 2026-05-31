import { useState, useMemo } from 'react';
import { marked } from 'marked';

const DEFAULT_MD = `# Titre principal

## Sous-titre

Voici un paragraphe avec du texte **gras**, de l'*italique* et du \`code inline\`.

### Liste non ordonnée

- Premier élément
- Deuxième élément
  - Élément imbriqué
- Troisième élément

### Liste ordonnée

1. Étape un
2. Étape deux
3. Étape trois

### Bloc de code

\`\`\`typescript
function saluer(nom: string): string {
  return \`Bonjour, \${nom} !\`;
}
\`\`\`

### Citation

> Ceci est une citation.
> Elle peut s'étendre sur plusieurs lignes.

### Lien

[Visitez Claude](https://claude.ai)

---

Fin de l'exemple.
`;

export default function MarkdownTool() {
  const [md, setMd] = useState<string>(DEFAULT_MD);
  const [copied, setCopied] = useState<boolean>(false);
  const [copyError, setCopyError] = useState<string>('');

  const html = useMemo<string>(() => {
    try {
      return marked.parse(md) as string;
    } catch (e) {
      return `<p style="color:#f87171;">Erreur de rendu : ${(e as Error).message}</p>`;
    }
  }, [md]);

  const copyHtml = () => {
    setCopyError('');
    navigator.clipboard.writeText(html).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        setCopyError('Impossible d\'accéder au presse-papier.');
      }
    );
  };

  return (
    <div className="flex flex-col gap-4 max-w-7xl mx-auto">
      {/* Bouton action */}
      <div className="flex items-center gap-3">
        <button className="btn" onClick={copyHtml}>
          {copied ? 'Copié ✓' : 'Copier le HTML'}
        </button>
        {copyError && (
          <span className="text-sm text-red-400">{copyError}</span>
        )}
      </div>

      {/* Deux colonnes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Colonne gauche : éditeur Markdown */}
        <div className="flex flex-col gap-2">
          <label className="lbl">Markdown</label>
          <textarea
            className="fld resize-none"
            style={{ minHeight: '520px' }}
            value={md}
            onChange={(e) => setMd(e.target.value)}
            spellCheck={false}
            placeholder="Saisissez votre Markdown ici…"
          />
        </div>

        {/* Colonne droite : aperçu rendu */}
        <div className="flex flex-col gap-2">
          <label className="lbl">Aperçu</label>
          <div
            className="card flex-1 overflow-auto
              [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-zinc-100 [&_h1]:mb-3 [&_h1]:mt-1
              [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-zinc-100 [&_h2]:mb-2 [&_h2]:mt-5
              [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-zinc-200 [&_h3]:mb-2 [&_h3]:mt-4
              [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-zinc-200 [&_h4]:mb-1 [&_h4]:mt-3
              [&_p]:text-zinc-300 [&_p]:leading-relaxed [&_p]:mb-3
              [&_a]:text-sky-400 [&_a]:underline [&_a]:hover:text-sky-300
              [&_strong]:text-zinc-100 [&_strong]:font-bold
              [&_em]:text-zinc-300 [&_em]:italic
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_ul]:text-zinc-300
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3 [&_ol]:text-zinc-300
              [&_li]:mb-1
              [&_code]:font-mono [&_code]:text-sm [&_code]:bg-zinc-800 [&_code]:text-emerald-300 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded
              [&_pre]:bg-zinc-800 [&_pre]:rounded [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:mb-3
              [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-emerald-300
              [&_blockquote]:border-l-4 [&_blockquote]:border-sky-600 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-zinc-400 [&_blockquote]:mb-3
              [&_hr]:border-zinc-700 [&_hr]:my-4
              [&_table]:w-full [&_table]:mb-3 [&_table]:border-collapse
              [&_th]:text-left [&_th]:p-2 [&_th]:border [&_th]:border-zinc-700 [&_th]:bg-zinc-800 [&_th]:text-zinc-200
              [&_td]:p-2 [&_td]:border [&_td]:border-zinc-700 [&_td]:text-zinc-300
              [&_img]:max-w-full [&_img]:rounded"
            style={{ minHeight: '520px' }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}
