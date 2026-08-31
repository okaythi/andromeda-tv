import { ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ChannelSummary } from '../../shared/catalog';
import { ChannelCard } from '../components/ChannelCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingGrid } from '../components/LoadingGrid';
import { useChannelsQuery } from '../features/catalog/queries';

interface ChannelsGridProps {
  onBack: () => void;
  onOpenChannel: (channel: ChannelSummary, trigger: HTMLElement) => void;
}

export function ChannelsGrid({ onBack, onOpenChannel }: ChannelsGridProps) {
  const channelsQuery = useChannelsQuery();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const channels = channelsQuery.data;
  const categories = useMemo(
    () => [...new Set((channels ?? []).map((channel) => channel.category))].sort((left, right) => left.localeCompare(right, 'pt-BR')),
    [channels],
  );
  const visibleChannels = activeCategory
    ? (channels ?? []).filter((channel) => channel.category === activeCategory)
    : (channels ?? []);

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
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">Ao vivo</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Todos os canais</h2>
        </div>
        {!channelsQuery.isPending && !channelsQuery.isError && (
          <p className="text-sm text-zinc-400">{visibleChannels.length} canais</p>
        )}
      </div>

      {categories.length > 1 && (
        <div className="mt-7 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Categorias de canais">
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === null}
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
              activeCategory === null ? 'bg-white text-black' : 'bg-white/10 text-zinc-300 hover:bg-white/20'
            }`}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={activeCategory === category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                activeCategory === category ? 'bg-white text-black' : 'bg-white/10 text-zinc-300 hover:bg-white/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8">
        {channelsQuery.isPending && <LoadingGrid count={10} aspect="landscape" />}
        {channelsQuery.isError && (
          <EmptyState
            title="Não foi possível carregar os canais"
            description="Verifique sua conexão e tente novamente."
            action={(
              <button
                type="button"
                onClick={() => void channelsQuery.refetch()}
                className="rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Tentar novamente
              </button>
            )}
          />
        )}
        {!channelsQuery.isPending && !channelsQuery.isError && visibleChannels.length === 0 && (
          <EmptyState
            title="Nenhum canal nesta categoria"
            description="Tente outra categoria ou atualize o catálogo."
          />
        )}
        {visibleChannels.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {visibleChannels.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} layout="grid" onOpen={onOpenChannel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
