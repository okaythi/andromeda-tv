import { ArrowRight } from 'lucide-react';
import type { ChannelSummary } from '../../shared/catalog';
import { ChannelCard } from './ChannelCard';

interface ChannelRowProps {
  channels: ChannelSummary[];
  onViewMore: (trigger: HTMLElement) => void;
  onOpenChannel: (channel: ChannelSummary, trigger: HTMLElement) => void;
}

export function ChannelRow({ channels, onViewMore, onOpenChannel }: ChannelRowProps) {
  if (channels.length === 0) return null;

  return (
    <section aria-labelledby="live-channels-heading">
      <button
        type="button"
        onClick={(event) => onViewMore(event.currentTarget)}
        className="group mb-4 flex items-center text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        <h2 id="live-channels-heading" className="text-xl font-semibold text-white">Canais ao vivo</h2>
        <span className="mx-3 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden="true" />
        <span className="flex items-center gap-1 text-sm text-zinc-300 transition group-hover:text-white">
          Ver todos
          <ArrowRight size={16} className="transition group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </button>
      <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-5 sm:-mx-12 sm:px-12">
        {channels.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} onOpen={onOpenChannel} />
        ))}
      </div>
    </section>
  );
}
