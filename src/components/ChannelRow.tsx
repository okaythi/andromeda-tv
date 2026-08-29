
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
      <div 
        className="flex items-center mb-4 group cursor-pointer w-max"
        onClick={onViewMore}
      >
        <h3 className="text-xl font-semibold">Canais ao Vivo</h3>
        <div className="mx-3 w-1.5 h-1.5 rounded-full bg-gray-600" />
        <span className="flex items-center gap-1 text-sm text-[#E5E5E5] group-hover:text-white transition-colors">
          Ver mais
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-12 px-12">
        {channels.map((ch, i) => (
          <ChannelCard key={ch.id + i} channel={ch} index={i} layout="row" />
        ))}
      </div>
    </section>
  );
}
