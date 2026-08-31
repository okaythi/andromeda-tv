import { ArrowRight } from 'lucide-react';
import type { TitleSummary } from '../../shared/catalog';
import { MovieCard } from './MovieCard';

interface CategoryRowProps {
  title: string;
  titles: TitleSummary[];
  onViewMore: (trigger: HTMLElement) => void;
  onOpenTitle: (title: TitleSummary, trigger: HTMLElement) => void;
}

export function CategoryRow({ title, titles, onViewMore, onOpenTitle }: CategoryRowProps) {
  if (titles.length === 0) return null;

  return (
    <section aria-labelledby={`category-${title}`}>
      <button
        type="button"
        onClick={(event) => onViewMore(event.currentTarget)}
        className="group mb-4 flex items-center text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        <h2 id={`category-${title}`} className="text-xl font-semibold text-white">{title}</h2>
        <span className="mx-3 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden="true" />
        <span className="flex items-center gap-1 text-sm text-zinc-300 transition group-hover:text-white">
          Ver mais
          <ArrowRight size={16} className="transition group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </button>
      <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-5 sm:-mx-12 sm:px-12">
        {titles.map((item) => (
          <MovieCard key={`${item.mediaType}:${item.id}`} title={item} onOpen={onOpenTitle} />
        ))}
      </div>
    </section>
  );
}
