import { Bookmark, BookmarkCheck, Play } from 'lucide-react';
import type { TitleSummary } from '../../../shared/catalog';
import { useFavorites } from '../../features/favorites/useFavorites';

interface TitleActionsProps {
  title: TitleSummary;
  onWatch: (trigger: HTMLElement) => void;
}

export function TitleActions({ title, onWatch }: TitleActionsProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(title);

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={(event) => onWatch(event.currentTarget)}
        className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <Play size={18} fill="currentColor" aria-hidden="true" />
        Assistir
      </button>
      <button
        type="button"
        onClick={() => toggleFavorite(title)}
        aria-pressed={favorite}
        className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-black/35 px-5 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {favorite ? <BookmarkCheck size={18} aria-hidden="true" /> : <Bookmark size={18} aria-hidden="true" />}
        {favorite ? 'Na minha lista' : 'Adicionar à lista'}
      </button>
    </div>
  );
}
