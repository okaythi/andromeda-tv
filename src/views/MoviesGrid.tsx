import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { type Movie, fetchMovies, fetchSeries } from '../api/backend';
import { MovieCard } from '../components/MovieCard';

interface MoviesGridProps {
  title: string;
  categoryFilter: string | undefined;
  isSeries: boolean;
  initialMovies: Movie[];
  onBack: () => void;
}

export function MoviesGrid({ title, categoryFilter, isSeries, initialMovies, onBack }: MoviesGridProps) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialMovies.length); // We'll update this
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reset state when category changes
    setMovies(initialMovies);
    setPage(1);
    setTotal(initialMovies.length);
    // Fetch first page to get correct total and complete list (since initial is just 20 items)
    fetchData(1, true);
  }, [title, categoryFilter, isSeries]);

  const fetchData = async (pageNum: number, isInitial = false) => {
    if (loading) return;
    setLoading(true);
    
    try {
      const fetcher = isSeries ? fetchSeries : fetchMovies;
      const res = await fetcher(pageNum, 50, categoryFilter);
      
      setTotal(res.total);
      if (isInitial) {
        setMovies(res.items);
      } else {
        setMovies(prev => [...prev, ...res.items]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage);
  };

  const hasMore = movies.length < total;

  return (
    <div className="min-h-full bg-[#0A0A0A] p-12">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Voltar</span>
      </button>

      <h2 className="text-3xl font-bold mb-8 capitalize">{title} <span className="text-xl text-gray-500 font-normal ml-2">({total} itens)</span></h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {movies.map((m, i) => (
          <MovieCard key={m.id + i} movie={m} index={i} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button 
            onClick={handleLoadMore}
            disabled={loading}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Carregando...' : 'Carregar mais'}
          </button>
        </div>
      )}
    </div>
  );
}
