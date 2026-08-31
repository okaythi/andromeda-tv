import { Star } from 'lucide-react';
import type { TitleMetadata } from '../../../shared/catalog';
import { formatRating, formatRuntime, formatYear } from '../../utils/format';

interface MetadataFactsProps {
  metadata: TitleMetadata;
}

export function MetadataFacts({ metadata }: MetadataFactsProps) {
  const facts = [
    formatYear(metadata.year, metadata.releaseDate),
    formatRuntime(metadata.runtimeMinutes),
  ].filter((fact): fact is string => fact !== null);
  const rating = formatRating(metadata.rating);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-zinc-300">
      {facts.map((fact) => <span key={fact}>{fact}</span>)}
      {rating && (
        <span className="inline-flex items-center gap-1 font-medium text-amber-300">
          <Star size={15} fill="currentColor" aria-hidden="true" />
          {rating}
        </span>
      )}
      {metadata.genres.map((genre) => (
        <span key={genre.id} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-300">
          {genre.name}
        </span>
      ))}
    </div>
  );
}
