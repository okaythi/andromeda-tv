import type { ChannelSummary, MediaType, TitleSummary } from '../../shared/catalog';
import { CategoryRow } from '../components/CategoryRow';
import { ChannelRow } from '../components/ChannelRow';
import { EmptyState } from '../components/EmptyState';
import { HeroSection } from '../components/HeroSection';
import { LoadingGrid } from '../components/LoadingGrid';
import { useChannelsQuery, useHomeQuery } from '../features/catalog/queries';

interface HomeViewProps {
  onViewChannels: (trigger: HTMLElement) => void;
  onViewCategory: (
    title: string,
    category: string | undefined,
    mediaType: MediaType,
    trigger: HTMLElement,
  ) => void;
  onOpenTitle: (title: TitleSummary, trigger: HTMLElement) => void;
  onOpenChannel: (channel: ChannelSummary, trigger: HTMLElement) => void;
  onWatchTitle: (title: TitleSummary, trigger: HTMLElement) => void;
}

export function HomeView({
  onViewChannels,
  onViewCategory,
  onOpenTitle,
  onOpenChannel,
  onWatchTitle,
}: HomeViewProps) {
  const homeQuery = useHomeQuery();
  const channelsQuery = useChannelsQuery();
  const homeData = homeQuery.data;
  const heroTitle = homeData?.popularMovies[0] ?? homeData?.popularSeries[0] ?? null;

  if (homeQuery.isPending) {
    return (
      <div className="pb-20">
        <div className="h-[510px] animate-pulse border-b border-white/5 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
        <div className="space-y-12 px-5 pt-10 sm:px-12">
          <LoadingGrid count={5} aspect="landscape" />
          <LoadingGrid count={6} />
        </div>
      </div>
    );
  }

  if (homeQuery.isError || !homeData) {
    return (
      <div className="px-5 py-16 sm:px-12">
        <EmptyState
          title="Não foi possível carregar o catálogo"
          description="Verifique sua conexão e tente novamente."
          action={(
            <button
              type="button"
              onClick={() => void homeQuery.refetch()}
              className="rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Tentar novamente
            </button>
          )}
        />
      </div>
    );
  }

  const categories = [
    { title: 'Filmes populares', titles: homeData.popularMovies, category: undefined, mediaType: 'movie' as const },
    { title: 'Séries em alta', titles: homeData.popularSeries, category: 'Séries', mediaType: 'series' as const },
    { title: 'Animes', titles: homeData.animes, category: 'Animes', mediaType: 'series' as const },
    { title: 'Doramas', titles: homeData.doramas, category: 'Doramas', mediaType: 'series' as const },
  ];

  const visibleCategories = categories.filter((category) => category.titles.length > 0);

  return (
    <div className="pb-20">
      {heroTitle ? (
        <HeroSection title={heroTitle} onOpen={onOpenTitle} onWatch={onWatchTitle} />
      ) : (
        <div className="px-5 py-16 sm:px-12">
          <EmptyState
            title="Ainda não há títulos em destaque"
            description="Quando seu catálogo estiver sincronizado, os destaques aparecerão aqui."
          />
        </div>
      )}

      <div className="space-y-12 px-5 pt-10 sm:px-12">
        {channelsQuery.isPending ? (
          <LoadingGrid count={5} aspect="landscape" />
        ) : channelsQuery.isError ? (
          <EmptyState
            title="Não foi possível carregar os canais"
            description="Tente atualizar o catálogo de canais."
            action={(
              <button
                type="button"
                onClick={() => void channelsQuery.refetch()}
                className="rounded-xl border border-white/20 px-5 py-3 font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Tentar novamente
              </button>
            )}
          />
        ) : channelsQuery.data && channelsQuery.data.length > 0 ? (
          <ChannelRow channels={channelsQuery.data} onViewMore={onViewChannels} onOpenChannel={onOpenChannel} />
        ) : null}

        {visibleCategories.map((category) => (
          <CategoryRow
            key={category.title}
            title={category.title}
            titles={category.titles.filter((title) => title.id !== heroTitle?.id)}
            onViewMore={(trigger) => onViewCategory(category.title, category.category, category.mediaType, trigger)}
            onOpenTitle={onOpenTitle}
          />
        ))}
      </div>
    </div>
  );
}
