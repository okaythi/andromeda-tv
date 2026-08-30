
import type { Movie } from '../api/backend';
import { getOptimizedImageUrl } from '../utils/image';

interface MovieCardProps {
  movie: Movie;
  index: number;
}

export function MovieCard({ movie, index }: MovieCardProps) {
  const fallbackUrl = `https://images.unsplash.com/photo-1618172193622-ae2d025f4032?q=80&w=400&auto=format&fit=crop&sig=${index + 10}`;
  const posterSrc = getOptimizedImageUrl(movie.posterUrl, fallbackUrl);

  return (
    <div className="min-w-[200px] h-[300px] rounded-2xl overflow-hidden relative cursor-pointer group">
      <img
        src={posterSrc}
        alt={movie.title || 'Selecionado'}
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src !== fallbackUrl) {
            target.src = fallbackUrl;
          }
        }}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-gray-900"
      />
    </div>
  );
}
