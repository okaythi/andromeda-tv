
import { ArrowLeft } from 'lucide-react';
import type { LiveStream } from '../api/backend';
import { ChannelCard } from '../components/ChannelCard';

interface ChannelsGridProps {
  channels: LiveStream[];
  onBack: () => void;
}

export function ChannelsGrid({ channels, onBack }: ChannelsGridProps) {
  const displayChannels = channels.length > 0 ? channels : Array(12).fill({
    id: 'mock',
    name: 'Ao Vivo em Alta',
    logoUrl: 'https://images.unsplash.com/photo-1541873676-a18131494184?q=80&w=600&auto=format&fit=crop'
  }) as LiveStream[];

  return (
    <div className="min-h-full bg-[#0A0A0A] p-12">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Voltar</span>
      </button>

      <h2 className="text-3xl font-bold mb-8">Todos os Canais ao Vivo</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {displayChannels.map((ch, i) => (
          <ChannelCard key={ch.id + i} channel={ch} index={i} layout="grid" />
        ))}
      </div>
    </div>
  );
}
