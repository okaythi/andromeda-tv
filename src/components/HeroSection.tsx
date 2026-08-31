import { Bookmark, BookmarkCheck, Play } from 'lucide-react';
import type { TitleSummary } from '../../shared/catalog';
import { useFavorites } from '../features/favorites/useFavorites';
import { Artwork } from './Artwork';

interface HeroSectionProps {
  title: TitleSummary;
  onOpen: (title: TitleSummary, trigger: HTMLElement) => void;
  onWatch: (title: TitleSummary, trigger: HTMLElement) => void;
}

export function HeroSection({ title, onOpen, onWatch }: HeroSectionProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(title);

  return (
    <section className="relative min-h-[510px] overflow-hidden border-b border-white/5">
      <div className="absolute inset-0">
        <Artwork src={title.backdropUrl} alt={`Imagem de fundo de ${title.title}`} aspect="backdrop" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/85 to-[#0A0A0A]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-black/35" />
      </div>
      <div className="relative z-10 max-w-2xl px-5 pb-20 pt-20 sm:px-12 sm:pt-28">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">Em destaque</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-6xl">{title.title}</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-200 sm:text-base">
          {title.overview || 'Detalhes deste título estão sendo atualizados.'}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={(event) => onWatch(title, event.currentTarget)}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Play size={18} fill="currentColor" aria-hidden="true" />
            Assistir
          </button>
          <button
            type="button"
            onClick={(event) => onOpen(title, event.currentTarget)}
            className="rounded-xl border border-white/20 bg-black/30 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Ver detalhes
          </button>
          <button
            type="button"
            onClick={() => toggleFavorite(title)}
            aria-pressed={favorite}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-black/30 px-5 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {favorite ? <BookmarkCheck size={18} aria-hidden="true" /> : <Bookmark size={18} aria-hidden="true" />}
            {favorite ? 'Na minha lista' : 'Minha lista'}
          </button>
        </div>
      </div>
    </section>
  );
}
