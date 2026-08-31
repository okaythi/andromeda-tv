import { Bookmark, BookmarkCheck } from 'lucide-react';
import type { TitleSummary } from '../../shared/catalog';
import { useFavorites } from '../features/favorites/useFavorites';
import { Artwork } from './Artwork';

interface MovieCardProps {
  title: TitleSummary;
  onOpen: (title: TitleSummary, trigger: HTMLElement) => void;
}

export function MovieCard({ title, onOpen }: MovieCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(title);

  return (
    <article className="group relative min-w-[156px] sm:min-w-[180px]">
      <button
        type="button"
        onClick={(event) => onOpen(title, event.currentTarget)}
        className="block w-full overflow-hidden rounded-2xl text-left transition duration-200 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        aria-label={`Abrir detalhes de ${title.title}`}
      >
        <div className="aspect-[2/3] overflow-hidden bg-zinc-900">
          <Artwork
            src={title.posterUrl}
            alt={`Pôster de ${title.title}`}
            aspect="poster"
            className="transition duration-300 group-hover:scale-105"
          />
        </div>
        <div className="pt-3">
          <p className="truncate text-sm font-semibold text-white">{title.title}</p>
          <p className="mt-1 truncate text-xs text-zinc-400">
            {title.category}{title.rating ? ` • ${title.rating}` : ''}
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={() => toggleFavorite(title)}
        aria-label={favorite ? `Remover ${title.title} da minha lista` : `Adicionar ${title.title} à minha lista`}
        aria-pressed={favorite}
        className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/65 text-white opacity-0 backdrop-blur transition hover:bg-black/90 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white group-hover:opacity-100"
      >
        {favorite ? <BookmarkCheck size={17} fill="currentColor" /> : <Bookmark size={17} />}
      </button>
    </article>
  );
}
