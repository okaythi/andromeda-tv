import { useMemo } from 'react';
import type { Movie, LiveStream, HomeData } from '../api/backend';
import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { ChannelRow } from '../components/ChannelRow';
import { CategoryRow } from '../components/CategoryRow';

interface HomeViewProps {
  homeData: HomeData | null;
  channels: LiveStream[];
  onViewAllChannels: () => void;
  onViewCategory: (title: string, categoryFilter: string | undefined, isSeries: boolean, initialMovies: Movie[]) => void;
}

export function HomeView({ homeData, channels, onViewAllChannels, onViewCategory }: HomeViewProps) {
  // Safe defaults if still loading
  const categories = useMemo(() => {
    if (!homeData) return [];
    
    return [
      { title: 'Filmes Populares', movies: homeData.popular_movies, categoryFilter: undefined, isSeries: false },
      { title: 'Séries em Alta', movies: homeData.popular_series, categoryFilter: 'Séries', isSeries: true },
      { title: 'Animes', movies: homeData.animes, categoryFilter: 'Animes', isSeries: true },
      { title: 'Doramas', movies: homeData.doramas, categoryFilter: 'Doramas', isSeries: true }
    ].filter(cat => cat.movies.length > 0);
  }, [homeData]);

  // Pick the first movie with a real TMDB backdrop as hero
  const heroMovie = useMemo(() => {
    const candidates = homeData?.popular_movies ?? [];
    const enriched = candidates.find(m => 
      m.backdropUrl?.includes('image.tmdb.org') && m.internalId !== 'here'
    );
    return enriched ?? candidates.find(m => m.internalId !== 'here') ?? {
      id: 'mock',
      internalId: 'mock',
      title: 'Sons em Órbita',
      overview: 'Uma série de ficção científica envolvente.',
      posterUrl: 'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?q=80&w=400&auto=format&fit=crop',
      backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2072&auto=format&fit=crop',
      category: 'Ficção Científica',
      rating: '8.0',
      tmdbId: null
    } as Movie;
  }, [homeData]);

  const displayChannels = channels.length > 0 ? channels : Array(12).fill({
    id: 'mock',
    internalId: 'mock',
    name: 'Ao Vivo em Alta',
    logoUrl: 'https://images.unsplash.com/photo-1541873676-a18131494184?q=80&w=600&auto=format&fit=crop',
    category: 'TV',
    source: 'Mock',
    links: '[]'
  }) as LiveStream[];

  return (
    <>
      <Header />
      <HeroSection movie={heroMovie} />

      {/* Content Rows */}
      <div className="relative z-10 px-12 pb-24 space-y-12 bg-gradient-to-b from-transparent to-[#0A0A0A]">
        <ChannelRow channels={displayChannels} onViewMore={onViewAllChannels} />
        
        {categories.map((cat) => (
          // Exclude the hero movie from the row if it's there
          <CategoryRow 
            key={cat.title} 
            title={cat.title} 
            movies={cat.movies.filter(m => m.id !== heroMovie.id)} 
            onViewMore={() => onViewCategory(cat.title, cat.categoryFilter, cat.isSeries, cat.movies)}
          />
        ))}
      </div>
    </>
  );
}
