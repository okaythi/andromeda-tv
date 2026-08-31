import { ArrowLeft } from 'lucide-react';
import type { TitleSummary } from '../../shared/catalog';
import { EmptyState } from '../components/EmptyState';
import { MovieCard } from '../components/MovieCard';
import { useFavorites } from '../features/favorites/useFavorites';

interface MyListViewProps {
  onBack: () => void;
  onOpenTitle: (title: TitleSummary, trigger: HTMLElement) => void;
}

export function MyListView({ onBack, onOpenTitle }: MyListViewProps) {
  const { favorites } = useFavorites();

  return (
    <div className="min-h-full px-5 py-10 sm:px-12">
      <button
        type="button"
        onClick={onBack}
        className="group mb-8 flex items-center gap-2 text-zinc-400 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        <ArrowLeft size={20} className="transition group-hover:-translate-x-1" aria-hidden="true" />
        Voltar
      </button>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">Biblioteca</p>
      <h2 className="mt-2 text-3xl font-bold text-white">Minha lista</h2>
      <p className="mt-2 text-sm text-zinc-400">{favorites.length} {favorites.length === 1 ? 'título salvo' : 'títulos salvos'}</p>

      <div className="mt-8">
        {favorites.length === 0 ? (
          <EmptyState
            title="Sua lista está vazia"
            description="Use o botão de marcador em um título para salvá-lo aqui."
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {favorites.map((title) => (
              <MovieCard key={`${title.mediaType}:${title.id}`} title={title} onOpen={onOpenTitle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
