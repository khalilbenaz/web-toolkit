import { useState, useRef, useCallback } from 'react';

export default function ImageBase64() {
  const [dataUri, setDataUri] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [dragging, setDragging] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
  }

  function processFile(file: File) {
    setError('');
    setDataUri('');
    setFileName('');
    setFileSize(0);

    if (!file.type.startsWith('image/')) {
      setError(`Le fichier "${file.name}" n'est pas une image reconnue (JPEG, PNG, GIF, WebP, SVG...).`);
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setDataUri(result);
      } else {
        setError('Erreur lors de la lecture du fichier.');
      }
    };
    reader.onerror = () => {
      setError('Impossible de lire le fichier. Veuillez réessayer.');
    };
    reader.readAsDataURL(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // reset input so the same file can be re-selected
    e.target.value = '';
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  function copy() {
    if (!dataUri) return;
    navigator.clipboard.writeText(dataUri).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function reset() {
    setDataUri('');
    setFileName('');
    setFileSize(0);
    setError('');
    setCopied(false);
  }

  return (
    <div className="space-y-6">
      {/* Zone de dépôt */}
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors select-none
          ${dragging
            ? 'border-sky-500 bg-sky-500/10 text-sky-300'
            : 'border-zinc-600 hover:border-zinc-400 text-zinc-400 hover:text-zinc-300'
          }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <svg
          className="mx-auto mb-3 w-10 h-10 opacity-60"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M16 9l-4-4m0 0L8 9m4-4v12" />
        </svg>
        <p className="text-sm font-medium">
          Glisser-déposer une image ici, ou{' '}
          <span className="text-sky-400 underline underline-offset-2">choisir un fichier</span>
        </p>
        <p className="text-xs mt-1 opacity-60">JPEG · PNG · GIF · WebP · SVG · AVIF · BMP…</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      {/* Erreur */}
      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      {/* Résultats */}
      {dataUri && (
        <>
          {/* Métadonnées */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="pill bg-zinc-700 text-zinc-300 text-xs">{fileName}</span>
            <span className="pill bg-zinc-700 text-zinc-300 text-xs">{formatSize(fileSize)}</span>
            <span className="pill bg-zinc-700 text-zinc-300 text-xs">
              {dataUri.split(';')[0].replace('data:', '')}
            </span>
            <button className="btn ml-auto text-sm" onClick={reset}>
              Réinitialiser
            </button>
          </div>

          {/* Aperçu */}
          <div>
            <label className="lbl">Aperçu</label>
            <div className="card flex items-center justify-center p-4 bg-zinc-800 rounded-xl min-h-[140px]">
              <img
                src={dataUri}
                alt={fileName}
                className="max-h-64 max-w-full rounded object-contain"
              />
            </div>
          </div>

          {/* Data URI */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="lbl mb-0">Data URI (Base64)</label>
              <button className="btn text-sm" onClick={copy}>
                {copied ? 'Copié ✓' : 'Copier le Data URI'}
              </button>
            </div>
            <textarea
              readOnly
              className="fld h-36 resize-y text-emerald-400 text-xs font-mono"
              value={dataUri}
            />
            <p className="text-xs text-zinc-500 mt-1">
              Taille encodée : {formatSize(dataUri.length)} ({dataUri.length.toLocaleString('fr-FR')} caractères)
            </p>
          </div>
        </>
      )}
    </div>
  );
}
