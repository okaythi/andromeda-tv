import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Play } from 'lucide-react';
import type { ChannelSummary } from '../../shared/catalog';
import { Artwork } from '../components/Artwork';
import { DetailBackButton } from '../components/detail/DetailBackButton';
import { GuideProgrammeList } from '../components/detail/GuideProgrammeList';
import { EmptyState } from '../components/EmptyState';
import { useChannelGuideQuery } from '../features/catalog/queries';
import { formatGuideDate } from '../utils/format';

interface ChannelDetailViewProps {
  channel: ChannelSummary;
  onBack: () => void;
  onWatch: (title: string, trigger: HTMLElement) => void;
}

function createGuideWindow(dayOffset: number): { from: Date; to: Date } {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() + dayOffset);
  const to = new Date(from);
  to.setDate(to.getDate() + 1);
  return { from, to };
}

export function ChannelDetailView({ channel, onBack, onWatch }: ChannelDetailViewProps) {
  const [dayOffset, setDayOffset] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const guideWindow = useMemo(() => createGuideWindow(dayOffset), [dayOffset]);
  const guideQuery = useChannelGuideQuery(channel.id, guideWindow.from, guideWindow.to);
  const dayOptions = useMemo(() => [0, 1, 2].map((offset) => ({
    offset,
    label: formatGuideDate(createGuideWindow(offset).from),
  })), []);

  useEffect(() => {
    headingRef.current?.focus();
  }, [channel.id]);

  return (
    <article className="min-h-full pb-20">
      <div className="border-b border-white/5 bg-gradient-to-br from-zinc-800 via-[#15151a] to-black px-5 pb-12 pt-8 sm:px-12">
        <DetailBackButton onBack={onBack} />
        <div className="mt-16 flex max-w-4xl flex-col gap-7 sm:flex-row sm:items-end">
          <div className="flex h-40 w-40 flex-none items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl">
            <Artwork src={channel.logoUrl} alt={`Logo de ${channel.name}`} aspect="logo" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">Canal ao vivo</p>
            <h1 ref={headingRef} tabIndex={-1} className="mt-3 text-4xl font-bold tracking-tight text-white outline-none sm:text-6xl">
              {channel.name}
            </h1>
            <p className="mt-3 text-sm text-zinc-300">{channel.category} • {channel.source}</p>
            <button
              type="button"
              onClick={(event) => onWatch(channel.name, event.currentTarget)}
              disabled={!channel.isPlayable}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Play size={18} fill="currentColor" aria-hidden="true" />
              {channel.isPlayable ? 'Assistir ao vivo' : 'Indisponível'}
            </button>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-5xl px-5 pt-10 sm:px-12" aria-labelledby="guide-heading">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">Programação</p>
            <h2 id="guide-heading" className="mt-2 text-2xl font-bold text-white">Guia do canal</h2>
          </div>
          <CalendarDays size={23} className="text-zinc-400" aria-hidden="true" />
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Dias do guia">
          {dayOptions.map((day) => (
            <button
              key={day.offset}
              type="button"
              role="tab"
              aria-selected={dayOffset === day.offset}
              onClick={() => setDayOffset(day.offset)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                dayOffset === day.offset ? 'bg-white text-black' : 'bg-white/10 text-zinc-300 hover:bg-white/20'
              }`}
            >
              {day.offset === 0 ? 'Hoje' : day.label}
            </button>
          ))}
        </div>

        <div className="mt-6" role="tabpanel">
          {guideQuery.isPending && (
            <div className="space-y-3" aria-label="Carregando guia">
              {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-24 animate-pulse rounded-xl bg-white/[0.07]" />)}
            </div>
          )}
          {guideQuery.isError && (
            <EmptyState
              title="Não foi possível carregar o guia"
              description="Tente novamente em alguns instantes."
              action={(
                <button
                  type="button"
                  onClick={() => void guideQuery.refetch()}
                  className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Tentar novamente
                </button>
              )}
            />
          )}
          {guideQuery.data && guideQuery.data.programmes.length === 0 && (
            <EmptyState
              title="Guia indisponível"
              description="Ainda não há programação publicada para este canal no período selecionado."
            />
          )}
          {guideQuery.data && guideQuery.data.programmes.length > 0 && (
            <GuideProgrammeList programmes={guideQuery.data.programmes} />
          )}
        </div>
      </section>
    </article>
  );
}
