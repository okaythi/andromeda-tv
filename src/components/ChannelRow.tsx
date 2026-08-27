
import { ArrowRight } from 'lucide-react';
import type { LiveStream } from '../api/backend';
import { ChannelCard } from './ChannelCard';

interface ChannelRowProps {
  channels: LiveStream[];
  onViewMore: () => void;
}

export function ChannelRow({ channels, onViewMore }: ChannelRowProps) {
  if (channels.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Canais ao Vivo</h3>
        <button
          onClick={onViewMore}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
        >
          Ver mais
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-12 px-12">
        {channels.map((ch, i) => (
          <ChannelCard key={ch.id + i} channel={ch} index={i} layout="row" />
        ))}
      </div>
    </section>
  );
}
