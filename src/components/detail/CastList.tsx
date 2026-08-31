import type { CastMember } from '../../../shared/catalog';
import { Artwork } from '../Artwork';

interface CastListProps {
  cast: CastMember[];
}

export function CastList({ cast }: CastListProps) {
  if (cast.length === 0) return null;

  return (
    <section aria-labelledby="cast-heading">
      <h2 id="cast-heading" className="text-xl font-bold text-white">Elenco</h2>
      <div className="mt-4 flex gap-4 overflow-x-auto pb-3">
        {cast.map((person) => (
          <article key={person.id} className="w-24 flex-none">
            <div className="aspect-square overflow-hidden rounded-full bg-zinc-800">
              <Artwork src={person.profileUrl} alt={`Foto de ${person.name}`} aspect="logo" />
            </div>
            <p className="mt-2 truncate text-sm font-semibold text-white">{person.name}</p>
            <p className="mt-1 truncate text-xs text-zinc-400">{person.role}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
