import type { RelatedTitle, TitleSummary } from '../../../shared/catalog';
import { Artwork } from '../Artwork';

interface RelatedTitlesProps {
  titles: RelatedTitle[];
  onOpenTitle: (title: TitleSummary, trigger: HTMLElement) => void;
}

function asCatalogTitle(title: RelatedTitle): TitleSummary | null {
  if (!title.catalogId) return null;
  return {
    id: title.catalogId,
    mediaType: title.mediaType,
    title: title.title,
    overview: title.overview,
    posterUrl: title.posterUrl,
    backdropUrl: title.backdropUrl,
    rating: title.rating?.toFixed(1) ?? null,
    tmdbId: title.tmdbId,
    category: 'Relacionado',
  };
}

export function RelatedTitles({ titles, onOpenTitle }: RelatedTitlesProps) {
  if (titles.length === 0) return null;

  return (
    <section aria-labelledby="related-heading">
      <h2 id="related-heading" className="text-xl font-bold text-white">Mais como este</h2>
      <div className="mt-4 flex gap-4 overflow-x-auto pb-4">
        {titles.map((title) => {
          const catalogTitle = asCatalogTitle(title);
          const content = (
            <>
              <div className="aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-900">
                <Artwork src={title.posterUrl} alt={`Pôster de ${title.title}`} aspect="poster" className="transition group-hover:scale-105" />
              </div>
              <p className="mt-3 truncate text-sm font-semibold text-white">{title.title}</p>
              <p className="mt-1 text-xs text-zinc-400">
                {catalogTitle ? 'Disponível no catálogo' : 'Indisponível na fonte atual'}
              </p>
            </>
          );

          return catalogTitle ? (
            <button
              key={title.tmdbId}
              type="button"
              onClick={(event) => onOpenTitle(catalogTitle, event.currentTarget)}
              className="group w-36 flex-none text-left transition hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              aria-label={`Abrir detalhes de ${title.title}`}
            >
              {content}
            </button>
          ) : (
            <article key={title.tmdbId} className="w-36 flex-none opacity-65" aria-label={`${title.title} não disponível`}>
              {content}
            </article>
          );
        })}
      </div>
    </section>
  );
}
