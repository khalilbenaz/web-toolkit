import { useState, useMemo } from 'react';

// ── Corpus latin ───────────────────────────────────────────────────────────────
// Liste de mots latins classiques (inspirés du De Finibus de Cicéron).
// Le texte est généré de façon purement déterministe : on parcourt cette liste
// en boucle, sans aucun tirage aléatoire.

const WORDS: readonly string[] = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'at', 'vero', 'eos',
  'accusamus', 'accusantium', 'doloremque', 'laudantium', 'totam', 'rem',
  'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo', 'inventore', 'veritatis',
  'quasi', 'architecto', 'beatae', 'vitae', 'dicta', 'explicabo', 'nemo',
  'ipsam', 'voluptatem', 'quia', 'voluptas', 'aspernatur', 'odit', 'fugit',
  'magnam', 'aliquam', 'quaerat', 'minima', 'nostrum', 'exercitationem',
  'ullam', 'corporis', 'suscipit', 'quidem', 'reiciendis', 'voluptatibus',
  'maiores', 'alias', 'perferendis', 'doloribus', 'asperiores', 'repellat',
  'itaque', 'earum', 'rerum', 'hic', 'tenetur', 'sapiente', 'delectus',
  'perspiciatis', 'unde', 'omnis', 'iste', 'natus', 'error', 'illum',
  'temporibus', 'autem', 'quibusdam', 'officiis', 'debitis', 'necessitatibus',
  'saepe', 'eveniet', 'voluptates', 'repudiandae', 'recusandae', 'itaque',
  'earum', 'harum', 'quidem', 'rerum', 'facilis', 'expedita', 'distinctio',
  'libero', 'tempora', 'cumque', 'nihil', 'impedit', 'placeat', 'facere',
  'possimus', 'omnis', 'assumenda', 'repellendus', 'temporibus', 'dignissimos',
  'blanditiis', 'praesentium', 'voluptatum', 'deleniti', 'atque', 'corrupti',
  'quos', 'dolores', 'quas', 'molestias', 'excepturi', 'similique', 'culpa',
  'obcaecati', 'provident', 'similique', 'sunt', 'culpa', 'qui', 'officia',
];

// Longueurs des phrases dans un paragraphe (déterministe, cycle fixe)
const SENTENCE_LENGTHS: readonly number[] = [8, 12, 7, 14, 10, 9, 13, 11, 8, 15];

// Nb de phrases par paragraphe (déterministe, cycle fixe)
const PARA_SENTENCE_COUNTS: readonly number[] = [4, 5, 3, 6, 4, 5, 4, 3];

// Incipit canonique de Lorem Ipsum
const LOREM_INCIPIT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

// ── Générateur déterministe ────────────────────────────────────────────────────

function buildParagraphs(count: number, startWithLorem: boolean): string[] {
  const paragraphs: string[] = [];

  // Curseur global dans la liste de mots (partagé entre tous les paragraphes)
  let wordIndex = 0;
  // Curseur dans les cycles de longueur
  let sentLenIdx = 0;
  let paraCountIdx = 0;

  for (let p = 0; p < count; p++) {
    // Cas spécial : premier paragraphe avec incipit Lorem Ipsum
    if (p === 0 && startWithLorem) {
      paragraphs.push(LOREM_INCIPIT);
      // Avancer le curseur de mots de la longueur de l'incipit pour ne pas
      // produire les mêmes mots dans le paragraphe 2
      wordIndex = (wordIndex + 18) % WORDS.length;
      continue;
    }

    const nbSentences = PARA_SENTENCE_COUNTS[paraCountIdx % PARA_SENTENCE_COUNTS.length];
    paraCountIdx++;

    const sentences: string[] = [];

    for (let s = 0; s < nbSentences; s++) {
      const nbWords = SENTENCE_LENGTHS[sentLenIdx % SENTENCE_LENGTHS.length];
      sentLenIdx++;

      const phraseWords: string[] = [];
      for (let w = 0; w < nbWords; w++) {
        phraseWords.push(WORDS[wordIndex % WORDS.length]);
        wordIndex++;
      }

      // Capitaliser le premier mot, terminer par un point
      phraseWords[0] =
        phraseWords[0].charAt(0).toUpperCase() + phraseWords[0].slice(1);
      sentences.push(phraseWords.join(' ') + '.');
    }

    paragraphs.push(sentences.join(' '));
  }

  return paragraphs;
}

// ── Composant ──────────────────────────────────────────────────────────────────

export default function LoremTool() {
  const [count, setCount]        = useState<number>(3);
  const [withLorem, setWithLorem] = useState<boolean>(true);
  const [copied, setCopied]      = useState(false);

  const paragraphs = useMemo(
    () => buildParagraphs(count, withLorem),
    [count, withLorem],
  );

  const fullText = paragraphs.join('\n\n');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silencieux si refus presse-papier
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Contrôles */}
      <div className="card flex flex-wrap gap-6 items-end">

        {/* Nombre de paragraphes */}
        <div className="flex-1 min-w-[160px]">
          <label className="lbl">
            Nombre de paragraphes
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={count}
            onChange={(e) => {
              const v = Math.max(1, Math.min(20, Number(e.target.value) || 1));
              setCount(v);
              setCopied(false);
            }}
            className="fld w-28"
          />
        </div>

        {/* Case Lorem ipsum */}
        <label className="flex items-center gap-3 cursor-pointer select-none pb-1">
          <input
            type="checkbox"
            checked={withLorem}
            onChange={(e) => {
              setWithLorem(e.target.checked);
              setCopied(false);
            }}
            className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
          />
          <span className="text-sm text-zinc-200">
            Commencer par{' '}
            <span className="font-mono text-xs text-zinc-400">« Lorem ipsum… »</span>
          </span>
        </label>

      </div>

      {/* Résultat */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <p className="lbl mb-0">
            Texte généré
            <span className="ml-2 pill normal-case tracking-normal font-normal">
              {paragraphs.length} paragraphe{paragraphs.length > 1 ? 's' : ''}
            </span>
          </p>
          <button className="btnp" onClick={copy}>
            {copied ? '✓ Copié' : 'Copier'}
          </button>
        </div>

        <div className="bg-zinc-950 border border-zinc-700 rounded-lg px-5 py-4 space-y-4 max-h-[32rem] overflow-y-auto">
          {paragraphs.map((para, i) => (
            <p key={i} className="text-sm text-zinc-300 leading-relaxed">
              {para}
            </p>
          ))}
        </div>
      </div>

    </div>
  );
}
