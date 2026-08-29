
import { ArrowRight } from 'lucide-react';
import type { Movie } from '../api/backend';
import { MovieCard } from './MovieCard';

interface CategoryRowProps {
  title: string;
  movies: Movie[];
  onViewMore: () => void;
}

export function CategoryRow({ title, movies, onViewMore }: CategoryRowProps) {
  if (movies.length === 0) return null;

  return (
    <section>
      <div 
        className="flex items-center mb-4 group cursor-pointer w-max"
        onClick={onViewMore}
      >
        <h3 className="text-xl font-semibold capitalize">{title}</h3>
        <div className="mx-3 w-1.5 h-1.5 rounded-full bg-gray-600" />
        <span className="flex items-center gap-1 text-sm text-[#E5E5E5] group-hover:text-white transition-colors">
          Ver mais
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-12 px-12">
        {movies.map((m, i) => (
          <MovieCard key={m.id + i} movie={m} index={i} />
        ))}
      </div>
    </section>
  );
}
