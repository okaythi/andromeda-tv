import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface PlaybackAvailabilityDialogProps {
  title: string;
  onClose: () => void;
}

export function PlaybackAvailabilityDialog({ title, onClose }: PlaybackAvailabilityDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="playback-dialog-title"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            onClose();
          }
        }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#17171c] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">Reprodução</p>
            <h2 id="playback-dialog-title" className="mt-2 text-xl font-bold text-white">
              {title}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-1 text-zinc-400 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <p className="mt-5 text-sm leading-6 text-zinc-300">
          Este catálogo já está pronto para navegação. A abertura de uma sessão de reprodução autorizada será adicionada na etapa de player, sem expor URLs ou credenciais de origem nesta tela.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Entendi
        </button>
      </section>
    </div>
  );
}
