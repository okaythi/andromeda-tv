import { useState } from 'react';
import type { GuideProgramme } from '../../../shared/catalog';
import { formatGuideTime } from '../../utils/format';
import { Artwork } from '../Artwork';

interface GuideProgrammeListProps {
  programmes: GuideProgramme[];
}

function isLive(programme: GuideProgramme, now: Date): boolean {
  const startsAt = Date.parse(programme.startsAt);
  const endsAt = Date.parse(programme.endsAt);
  return !Number.isNaN(startsAt) && !Number.isNaN(endsAt) && startsAt <= now.getTime() && now.getTime() < endsAt;
}

export function GuideProgrammeList({ programmes }: GuideProgrammeListProps) {
  const [now] = useState(() => new Date());

  return (
    <ol className="space-y-3">
      {programmes.map((programme) => {
        const live = isLive(programme, now);
        return (
          <li
            key={programme.id}
            className={`flex gap-4 rounded-xl border p-3 ${
              live ? 'border-red-400/40 bg-red-500/10' : 'border-white/10 bg-white/[0.03]'
            }`}
          >
            <div className="h-16 w-24 flex-none overflow-hidden rounded-lg bg-zinc-900">
              <Artwork src={programme.posterUrl} alt={`Imagem de ${programme.title}`} aspect="still" />
            </div>
            <div className="min-w-0 py-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-white">{programme.title}</p>
                {live && <span className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">AO VIVO</span>}
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                {formatGuideTime(programme.startsAt)} – {formatGuideTime(programme.endsAt)}
              </p>
              {programme.description && <p className="mt-2 line-clamp-2 text-sm text-zinc-300">{programme.description}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
