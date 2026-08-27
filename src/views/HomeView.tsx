import { useMemo } from 'react';
import type { Movie, LiveStream } from '../api/backend';
import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { ChannelRow } from '../components/ChannelRow';
import { CategoryRow } from '../components/CategoryRow';
import { groupBy } from '../utils/grouping';

interface HomeViewProps {
  movies: Movie[];
  channels: LiveStream[];
  onViewAllChannels: () => void;
}

export function HomeView({ movies, channels, onViewAllChannels }: HomeViewProps) {
  // Filter out placeholder movies from backend
  const validMovies = useMemo(() => movies.filter(m => !m.title.includes('ÚLTIMOS ADICIONADOS')), [movies]);

  const displayMovies = validMovies.length > 0 ? validMovies : Array(5).fill({
    id: 'mock',
    title: 'Sons em Órbita',
    overview: 'Uma série de ficção científica envolvente.',
    posterUrl: 'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?q=80&w=400&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2072&auto=format&fit=crop',
    category: 'Ficção Científica'
  }) as Movie[];

  const displayChannels = channels.length > 0 ? channels : Array(12).fill({
    id: 'mock',
    name: 'Ao Vivo em Alta',
    logoUrl: 'https://images.unsplash.com/photo-1541873676-a18131494184?q=80&w=600&auto=format&fit=crop'
  }) as LiveStream[];

  const heroMovie = displayMovies[0];
  const remainingMovies = displayMovies.slice(1);

  // Dynamically group remaining movies by their category
  const categories = useMemo(() => groupBy(remainingMovies, m => m.category || 'Feito Para Você'), [remainingMovies]);

  return (
    <>
      <Header />
      <HeroSection movie={heroMovie} />

      {/* Content Rows */}
      <div className="relative z-10 px-12 pb-24 space-y-12 bg-gradient-to-b from-transparent to-[#0A0A0A]">
        <ChannelRow channels={displayChannels} onViewMore={onViewAllChannels} />
        
        {Object.entries(categories).map(([categoryName, categoryMovies]) => (
          <CategoryRow key={categoryName} title={categoryName} movies={categoryMovies} />
        ))}
      </div>
    </>
  );
}
