// Table des entités HTML nommées courantes (décodage)
export const NAMED: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  copy: '©',
  reg: '®',
  trade: '™',
  euro: '€',
  pound: '£',
  yen: '¥',
  cent: '¢',
  mdash: '—',
  ndash: '–',
  laquo: '«',
  raquo: '»',
  hellip: '…',
  prime: '′',
  Prime: '″',
  larr: '←',
  rarr: '→',
  uarr: '↑',
  darr: '↓',
  bull: '•',
  middot: '·',
  acute: '´',
  cedil: '¸',
  uml: '¨',
  macr: '¯',
  deg: '°',
  plusmn: '±',
  frac14: '¼',
  frac12: '½',
  frac34: '¾',
  times: '×',
  divide: '÷',
  iexcl: '¡',
  iquest: '¿',
  szlig: 'ß',
  agrave: 'à',
  aacute: 'á',
  acirc: 'â',
  atilde: 'ã',
  auml: 'ä',
  aring: 'å',
  aelig: 'æ',
  ccedil: 'ç',
  egrave: 'è',
  eacute: 'é',
  ecirc: 'ê',
  euml: 'ë',
  igrave: 'ì',
  iacute: 'í',
  icirc: 'î',
  iuml: 'ï',
  eth: 'ð',
  ntilde: 'ñ',
  ograve: 'ò',
  oacute: 'ó',
  ocirc: 'ô',
  otilde: 'õ',
  ouml: 'ö',
  oslash: 'ø',
  ugrave: 'ù',
  uacute: 'ú',
  ucirc: 'û',
  uuml: 'ü',
  yacute: 'ý',
  thorn: 'þ',
  yuml: 'ÿ',
  Agrave: 'À',
  Aacute: 'Á',
  Acirc: 'Â',
  Atilde: 'Ã',
  Auml: 'Ä',
  Aring: 'Å',
  AElig: 'Æ',
  Ccedil: 'Ç',
  Egrave: 'È',
  Eacute: 'É',
  Ecirc: 'Ê',
  Euml: 'Ë',
  Igrave: 'Ì',
  Iacute: 'Í',
  Icirc: 'Î',
  Iuml: 'Ï',
  ETH: 'Ð',
  Ntilde: 'Ñ',
  Ograve: 'Ò',
  Oacute: 'Ó',
  Ocirc: 'Ô',
  Otilde: 'Õ',
  Ouml: 'Ö',
  Oslash: 'Ø',
  Ugrave: 'Ù',
  Uacute: 'Ú',
  Ucirc: 'Û',
  Uuml: 'Ü',
  Yacute: 'Ý',
  THORN: 'Þ',
  Szlig: 'ß',
};

export function encodeHtml(text: string): string {
  // Array.from itère par point de code : les caractères hors BMP restent entiers.
  return Array.from(text)
    .map((ch) => {
      if (ch === '&') return '&amp;';
      if (ch === '<') return '&lt;';
      if (ch === '>') return '&gt;';
      if (ch === '"') return '&quot;';
      if (ch === "'") return '&#39;';
      const code = ch.codePointAt(0)!;
      if (code > 127) return `&#${code};`;
      return ch;
    })
    .join('');
}

// Un point de code hors de [0, 0x10FFFF] ferait lever RangeError : on garde l'entité telle quelle.
function fromCode(code: number, original: string): string {
  return Number.isInteger(code) && code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : original;
}

export function decodeHtml(text: string): string {
  return text.replace(/&([^;]+);/g, (_match, entity: string) => {
    // Entité numérique hexadécimale &#xHH;
    if (/^#x[0-9a-fA-F]+$/.test(entity)) {
      return fromCode(parseInt(entity.slice(2), 16), _match);
    }
    // Entité numérique décimale &#nn;
    if (/^#\d+$/.test(entity)) {
      return fromCode(parseInt(entity.slice(1), 10), _match);
    }
    // Entité nommée
    if (Object.prototype.hasOwnProperty.call(NAMED, entity)) {
      return NAMED[entity];
    }
    return `&${entity};`;
  });
}
