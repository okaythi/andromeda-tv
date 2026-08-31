import { useEffect, useRef } from 'react';
import type { TitleSummary } from '../../shared/catalog';
import { Artwork } from '../components/Artwork';
import { CastList } from '../components/detail/CastList';
import { DetailBackButton } from '../components/detail/DetailBackButton';
import { MetadataFacts } from '../components/detail/MetadataFacts';
import { MetadataStatusNotice } from '../components/detail/MetadataStatusNotice';
import { RelatedTitles } from '../components/detail/RelatedTitles';
import { SeasonsPanel } from '../components/detail/SeasonsPanel';
import { TitleActions } from '../components/detail/TitleActions';
import { TmdbAttribution } from '../components/detail/TmdbAttribution';
import { TrailerList } from '../components/detail/TrailerList';
import { EmptyState } from '../components/EmptyState';
import { useTitleDetailQuery } from '../features/catalog/queries';

interface TitleDetailViewProps {
  title: TitleSummary;
  onBack: () => void;
  onOpenTitle: (title: TitleSummary, trigger: HTMLElement) => void;
  onWatch: (title: TitleSummary, trigger: HTMLElement) => void;
}

export function TitleDetailView({ title, onBack, onOpenTitle, onWatch }: TitleDetailViewProps) {
  const titleQuery = useTitleDetailQuery(title);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const detail = titleQuery.data;
  const catalog = detail?.catalog ?? title;
  const metadata = detail?.metadata;
  const displayTitle = catalog.title;
  const displayOverview = metadata?.overview || catalog.overview || 'Detalhes deste título estão sendo atualizados.';
  const backdropUrl = metadata?.backdropUrl ?? catalog.backdropUrl;
  const posterUrl = metadata?.posterUrl ?? catalog.posterUrl;

  useEffect(() => {
    headingRef.current?.focus();
  }, [title.id, title.mediaType]);

  return (
    <article className="min-h-full pb-20">
      <div className="relative min-h-[520px] overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <Artwork src={backdropUrl} alt={`Imagem de fundo de ${displayTitle}`} aspect="backdrop" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/85 to-[#0A0A0A]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/15 to-black/45" />
        </div>
        <div className="relative z-10 px-5 pt-8 sm:px-12">
          <DetailBackButton onBack={onBack} />
        </div>
        <div className="relative z-10 flex max-w-5xl flex-col gap-7 px-5 pb-14 pt-16 sm:flex-row sm:items-end sm:px-12 sm:pt-28">
          <div className="h-52 w-36 flex-none overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl sm:h-72 sm:w-48">
            <Artwork src={posterUrl} alt={`Pôster de ${displayTitle}`} aspect="poster" />
          </div>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
              {catalog.mediaType === 'movie' ? 'Filme' : 'Série'} • {catalog.category}
            </p>
            <h1 ref={headingRef} tabIndex={-1} className="mt-3 text-4xl font-bold tracking-tight text-white outline-none sm:text-6xl">
              {displayTitle}
            </h1>
            {metadata?.originalTitle && metadata.originalTitle !== displayTitle && (
              <p className="mt-2 text-sm text-zinc-400">{metadata.originalTitle}</p>
            )}
            <div className="mt-4">
              {metadata ? <MetadataFacts metadata={metadata} /> : <div className="h-5 w-56 animate-pulse rounded bg-white/15" />}
            </div>
            <p className="mt-5 text-sm leading-6 text-zinc-200 sm:text-base">{displayOverview}</p>
            {metadata?.tagline && <p className="mt-4 text-sm italic text-zinc-400">“{metadata.tagline}”</p>}
            <div className="mt-7">
              <TitleActions title={catalog} onWatch={(trigger) => onWatch(catalog, trigger)} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-12 px-5 pt-10 sm:px-12">
        {titleQuery.isError && (
          <EmptyState
            title="Não foi possível atualizar os detalhes"
            description="Os dados básicos do catálogo continuam disponíveis. Tente atualizar os detalhes novamente."
            action={(
              <button
                type="button"
                onClick={() => void titleQuery.refetch()}
                className="rounded-xl border border-white/20 px-5 py-3 font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Atualizar detalhes
              </button>
            )}
          />
        )}
        {metadata && <MetadataStatusNotice status={metadata.status} />}
        {metadata && <TrailerList trailers={metadata.trailers} />}
        {metadata && catalog.mediaType === 'series' && (
          <SeasonsPanel seriesId={catalog.id} seasons={metadata.seasons} />
        )}
        {metadata && <CastList cast={metadata.cast} />}
        {detail && <RelatedTitles titles={detail.related} onOpenTitle={onOpenTitle} />}
        {metadata?.status === 'ready' && <TmdbAttribution />}
      </div>
    </article>
  );
}
