import { ExternalLink, Play } from 'lucide-react';
import type { Trailer } from '../../../shared/catalog';

interface TrailerListProps {
  trailers: Trailer[];
}

export function TrailerList({ trailers }: TrailerListProps) {
  if (trailers.length === 0) return null;

  return (
    <section aria-labelledby="trailers-heading">
      <h2 id="trailers-heading" className="text-xl font-bold text-white">Trailers</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {trailers.map((trailer) => (
          <a
            key={trailer.id}
            href={trailer.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex max-w-full items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Play size={16} aria-hidden="true" />
            <span className="max-w-56 truncate">{trailer.name}</span>
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        ))}
      </div>
    </section>
  );
}
