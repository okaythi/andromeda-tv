
import type { Movie } from '../api/backend';

interface MovieCardProps {
  movie: Movie;
  index: number;
}

export function MovieCard({ movie, index }: MovieCardProps) {
  return (
    <div className="min-w-[200px] h-[300px] rounded-2xl overflow-hidden relative cursor-pointer group">
      <img
        src={movie.posterUrl || `https://images.unsplash.com/photo-1618172193622-ae2d025f4032?q=80&w=400&auto=format&fit=crop&sig=${index + 10}`}
        alt="Selecionado"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-gray-900"
      />
    </div>
  );
}
