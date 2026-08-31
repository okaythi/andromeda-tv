import { ArrowLeft } from 'lucide-react';
import type { ChannelSummary, TitleSummary } from '../../shared/catalog';
import { ChannelCard } from '../components/ChannelCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingGrid } from '../components/LoadingGrid';
import { MovieCard } from '../components/MovieCard';
import { useSearchQuery } from '../features/catalog/queries';

interface SearchViewProps {
  query: string;
  onBack: () => void;
  onOpenTitle: (title: TitleSummary, trigger: HTMLElement) => void;
  onOpenChannel: (channel: ChannelSummary, trigger: HTMLElement) => void;
}

export function SearchView({ query, onBack, onOpenTitle, onOpenChannel }: SearchViewProps) {
  const searchQuery = useSearchQuery(query);
  const canSearch = query.trim().length >= 2;

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
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">Catálogo</p>
        <h2 className="mt-2 text-3xl font-bold text-white">Pesquisar</h2>
      </div>

      {!canSearch && (
        <div className="mt-10">
          <EmptyState
            title="Encontre algo para assistir"
            description="Use a busca no topo da tela para procurar títulos e canais. Digite pelo menos dois caracteres."
          />
        </div>
      )}
      {canSearch && searchQuery.isPending && <div className="mt-10"><LoadingGrid /></div>}
      {canSearch && searchQuery.isError && (
        <div className="mt-10">
          <EmptyState
            title="A pesquisa não pôde ser concluída"
            description="Verifique sua conexão e tente novamente."
            action={(
              <button
                type="button"
                onClick={() => void searchQuery.refetch()}
                className="rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Tentar novamente
              </button>
            )}
          />
        </div>
      )}
      {searchQuery.data && (
        <div className="mt-10 space-y-12">
          {searchQuery.data.titles.length === 0 && searchQuery.data.channels.length === 0 && (
            <EmptyState
              title="Nenhum resultado para “{searchQuery.data.query}”"
              description="Tente outro título, artista ou nome de canal."
            />
          )}
          {searchQuery.data.titles.length > 0 && (
            <section aria-labelledby="search-titles-heading">
              <h3 id="search-titles-heading" className="text-xl font-bold text-white">Títulos</h3>
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                {searchQuery.data.titles.map((title) => (
                  <MovieCard key={`${title.mediaType}:${title.id}`} title={title} onOpen={onOpenTitle} />
                ))}
              </div>
            </section>
          )}
          {searchQuery.data.channels.length > 0 && (
            <section aria-labelledby="search-channels-heading">
              <h3 id="search-channels-heading" className="text-xl font-bold text-white">Canais</h3>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {searchQuery.data.channels.map((channel) => (
                  <ChannelCard key={channel.id} channel={channel} layout="grid" onOpen={onOpenChannel} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
