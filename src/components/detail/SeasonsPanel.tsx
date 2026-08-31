import { useState } from 'react';
import type { SeasonSummary } from '../../../shared/catalog';
import { useSeasonDetailQuery } from '../../features/catalog/queries';
import { formatRuntime } from '../../utils/format';
import { Artwork } from '../Artwork';
import { EmptyState } from '../EmptyState';

interface SeasonsPanelProps {
  seriesId: string;
  seasons: SeasonSummary[];
}

export function SeasonsPanel({ seriesId, seasons }: SeasonsPanelProps) {
  const [requestedSeason, setRequestedSeason] = useState<number | null>(null);
  const selectedSeason = seasons.some((season) => season.seasonNumber === requestedSeason)
    ? requestedSeason
    : seasons[0]?.seasonNumber ?? null;
  const seasonQuery = useSeasonDetailQuery(seriesId, selectedSeason);

  if (seasons.length === 0) return null;

  return (
    <section aria-labelledby="seasons-heading">
      <h2 id="seasons-heading" className="text-xl font-bold text-white">Temporadas</h2>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Temporadas">
        {seasons.map((season) => (
          <button
            key={season.seasonNumber}
            type="button"
            role="tab"
            aria-selected={selectedSeason === season.seasonNumber}
            onClick={() => setRequestedSeason(season.seasonNumber)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
              selectedSeason === season.seasonNumber ? 'bg-white text-black' : 'bg-white/10 text-zinc-300 hover:bg-white/20'
            }`}
          >
            {season.name || `Temporada ${season.seasonNumber}`}
          </button>
        ))}
      </div>

      <div className="mt-5" role="tabpanel">
        {seasonQuery.isPending && (
          <div className="space-y-3" aria-label="Carregando episódios">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-xl bg-white/[0.07]" />
            ))}
          </div>
        )}
        {seasonQuery.isError && (
          <EmptyState
            title="Não foi possível carregar os episódios"
            description="Tente selecionar esta temporada novamente."
            action={(
              <button
                type="button"
                onClick={() => void seasonQuery.refetch()}
                className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Tentar novamente
              </button>
            )}
          />
        )}
        {seasonQuery.data?.status === 'ready' && seasonQuery.data.episodes.length === 0 && (
          <EmptyState
            title="Nenhum episódio listado"
            description="Os detalhes desta temporada ainda não estão disponíveis."
          />
        )}
        {seasonQuery.data?.status === 'ready' && seasonQuery.data.episodes.length > 0 && (
          <ol className="space-y-3">
            {seasonQuery.data.episodes.map((episode) => (
              <li key={episode.episodeNumber} className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="h-20 w-32 flex-none overflow-hidden rounded-lg bg-zinc-900 sm:h-24 sm:w-40">
                  <Artwork src={episode.stillUrl} alt={`Imagem do episódio ${episode.episodeNumber}`} aspect="still" />
                </div>
                <div className="min-w-0 py-1">
                  <p className="text-sm font-semibold text-white">
                    {episode.episodeNumber}. {episode.name}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm leading-5 text-zinc-400">{episode.overview || 'Sinopse indisponível.'}</p>
                  {formatRuntime(episode.runtimeMinutes) && (
                    <p className="mt-2 text-xs text-zinc-500">{formatRuntime(episode.runtimeMinutes)}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
        {seasonQuery.data && seasonQuery.data.status !== 'ready' && (
          <EmptyState
            title="Detalhes da temporada indisponíveis"
            description="Não foi possível obter os dados desta temporada no momento."
          />
        )}
      </div>
    </section>
  );
}
