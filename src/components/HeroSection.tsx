
import { Play, Plus } from 'lucide-react';
import type { Movie } from '../api/backend';
import { getOptimizedImageUrl } from '../utils/image';

interface HeroSectionProps {
  movie?: Movie;
}

export function HeroSection({ movie }: HeroSectionProps) {
  if (!movie) return null;

  const fallbackBackdrop = 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2072&auto=format&fit=crop';
  const backdropSrc = getOptimizedImageUrl(movie.backdropUrl, fallbackBackdrop);

  return (
    <>
      {/* Hero Background Image */}
      <div className="absolute top-0 left-0 w-full h-[70vh] z-0">
        <img
          src={backdropSrc}
          alt={movie.title || 'Fundo Hero'}
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== fallbackBackdrop) {
              target.src = fallbackBackdrop;
            }
          }}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 px-12 pt-12 pb-16 max-w-2xl">
        <h2 className="text-6xl font-bold mb-4 tracking-tight">{movie.title}</h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-8 max-w-lg">
          {movie.overview}
        </p>

        <div className="flex items-center gap-4">
          <button className="flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black px-8 py-3 rounded-xl font-semibold transition-colors">
            <Play size={18} fill="currentColor" />
            Assistir
          </button>
          <button className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white px-8 py-3 rounded-xl font-semibold transition-colors">
            <Plus size={18} />
            Adicionar à Lista
          </button>
        </div>
      </div>
    </>
  );
}
