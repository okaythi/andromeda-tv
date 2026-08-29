import { ArrowLeft } from 'lucide-react';
import type { Movie } from '../api/backend';
import { MovieCard } from '../components/MovieCard';

interface MoviesGridProps {
  title: string;
  movies: Movie[];
  onBack: () => void;
}

export function MoviesGrid({ title, movies, onBack }: MoviesGridProps) {
  return (
    <div className="min-h-full bg-[#0A0A0A] p-12">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Voltar</span>
      </button>

      <h2 className="text-3xl font-bold mb-8 capitalize">{title}</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {movies.map((m, i) => (
          <MovieCard key={m.id + i} movie={m} index={i} />
        ))}
      </div>
    </div>
  );
}
