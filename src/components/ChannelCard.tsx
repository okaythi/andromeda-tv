import { Radio } from 'lucide-react';
import type { ChannelSummary } from '../../shared/catalog';
import { Artwork } from './Artwork';

interface ChannelCardProps {
  channel: ChannelSummary;
  layout?: 'row' | 'grid';
  onOpen: (channel: ChannelSummary, trigger: HTMLElement) => void;
}

export function ChannelCard({ channel, layout = 'row', onOpen }: ChannelCardProps) {
  const imageContainerClass = layout === 'row'
    ? 'h-[150px]'
    : 'aspect-video';

  return (
    <article className={layout === 'row' ? 'group min-w-[250px]' : 'group'}>
      <button
        type="button"
        onClick={(event) => onOpen(channel, event.currentTarget)}
        className="block w-full text-left transition duration-200 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        aria-label={`Abrir canal ${channel.name}`}
      >
        <div className={`relative overflow-hidden rounded-2xl bg-zinc-900 ${imageContainerClass}`}>
          <Artwork
            src={channel.logoUrl}
            alt={`Logo de ${channel.name}`}
            aspect="logo"
            className="transition duration-300 group-hover:scale-105"
          />
          {channel.isPlayable && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md bg-red-500 px-2 py-1 text-[10px] font-bold tracking-wide text-white">
              <Radio size={11} aria-hidden="true" />
              AO VIVO
            </span>
          )}
        </div>
        <div className="pt-3">
          <p className="truncate text-sm font-semibold text-white group-hover:text-red-300">{channel.name}</p>
          <p className="mt-1 truncate text-xs text-zinc-400">{channel.category}</p>
        </div>
      </button>
    </article>
  );
}
