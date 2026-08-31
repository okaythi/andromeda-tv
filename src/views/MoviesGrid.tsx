import { ArrowLeft } from 'lucide-react';
import type { MediaType, TitleSummary } from '../../shared/catalog';
import { EmptyState } from '../components/EmptyState';
import { LoadingGrid } from '../components/LoadingGrid';
import { MovieCard } from '../components/MovieCard';
import { useTitlePagesQuery } from '../features/catalog/queries';

interface MoviesGridProps {
  title: string;
  category: string | undefined;
  mediaType: MediaType;
  onBack: () => void;
  onOpenTitle: (title: TitleSummary, trigger: HTMLElement) => void;
}

export function MoviesGrid({ title, category, mediaType, onBack, onOpenTitle }: MoviesGridProps) {
  const titlesQuery = useTitlePagesQuery(mediaType, category);
  const titles = titlesQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const total = titlesQuery.data?.pages[0]?.total ?? 0;

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

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
            {mediaType === 'movie' ? 'Filmes' : 'Séries'}
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">{title}</h2>
        </div>
        {!titlesQuery.isPending && !titlesQuery.isError && (
          <p className="text-sm text-zinc-400">{total} títulos</p>
        )}
      </div>

      <div className="mt-8">
        {titlesQuery.isPending && <LoadingGrid />}
        {titlesQuery.isError && (
          <EmptyState
            title="Não foi possível carregar estes títulos"
            description="Verifique sua conexão e tente novamente."
            action={(
              <button
                type="button"
                onClick={() => void titlesQuery.refetch()}
                className="rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Tentar novamente
              </button>
            )}
          />
        )}
        {!titlesQuery.isPending && !titlesQuery.isError && titles.length === 0 && (
          <EmptyState
            title="Nenhum título encontrado"
            description="Este catálogo ainda não possui títulos nesta categoria."
          />
        )}
        {titles.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {titles.map((item) => (
              <MovieCard key={`${item.mediaType}:${item.id}`} title={item} onOpen={onOpenTitle} />
            ))}
          </div>
        )}
      </div>

      {titlesQuery.hasNextPage && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={() => void titlesQuery.fetchNextPage()}
            disabled={titlesQuery.isFetchingNextPage}
            className="rounded-full bg-white/10 px-8 py-3 font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {titlesQuery.isFetchingNextPage ? 'Carregando…' : 'Carregar mais'}
          </button>
        </div>
      )}
    </div>
  );
}
