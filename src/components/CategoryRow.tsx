
import type { Movie } from '../api/backend';
import { MovieCard } from './MovieCard';

interface CategoryRowProps {
  title: string;
  movies: Movie[];
}

export function CategoryRow({ title, movies }: CategoryRowProps) {
  if (movies.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold capitalize">{title}</h3>
      </div>
      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-12 px-12">
        {movies.map((m, i) => (
          <MovieCard key={m.id + i} movie={m} index={i} />
        ))}
      </div>
    </section>
  );
}
