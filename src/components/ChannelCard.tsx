
import { Eye } from 'lucide-react';
import type { LiveStream } from '../api/backend';

interface ChannelCardProps {
  channel: LiveStream;
  index: number;
  layout?: 'row' | 'grid';
}

export function ChannelCard({ channel, index, layout = 'row' }: ChannelCardProps) {
  const containerClass = layout === 'row' ? 'min-w-[280px] group cursor-pointer' : 'group cursor-pointer';
  const imageContainerClass = layout === 'row' 
    ? 'w-full h-[160px] rounded-2xl overflow-hidden relative mb-3'
    : 'w-full aspect-video rounded-2xl overflow-hidden relative mb-3';

  return (
    <div className={containerClass}>
      <div className={imageContainerClass}>
        <img
          src={channel.logoUrl || `https://images.unsplash.com/photo-1541873676-a18131494184?q=80&w=600&auto=format&fit=crop&sig=${index}`}
          alt="Miniatura"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-gray-900"
        />
        {/* Live Badge */}
        <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          AO VIVO
        </div>
        {/* Viewers */}
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded flex items-center gap-1">
          <Eye size={12} />
          {Math.floor(Math.random() * 20 + 1)},{Math.floor(Math.random() * 9)}K
        </div>
      </div>
      <h4 className="font-medium text-sm text-white group-hover:text-red-400 transition-colors truncate">{channel.name}</h4>
      <p className="text-xs text-gray-500 mt-1 truncate">{channel.category || 'Transmissão ao Vivo'}</p>
    </div>
  );
}
