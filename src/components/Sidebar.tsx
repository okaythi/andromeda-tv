
import { Home, Compass, Users, User, Play } from 'lucide-react';

export type ViewType = 'home' | 'channels';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-24 flex flex-col items-center py-8 bg-[#0A0A0A] z-20 border-r border-white/5 flex-shrink-0">
      {/* Logo */}
      <div className="mb-12">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-red-500 rounded-xl flex items-center justify-center transform rotate-45">
          <Play size={20} className="text-white -rotate-45 ml-1" fill="currentColor" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-8 w-full px-4">
        <button
          onClick={() => onViewChange('home')}
          className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-colors ${
            currentView === 'home' ? 'text-white bg-white/10' : 'text-gray-500 hover:text-white'
          }`}
        >
          <Home size={22} />
          <span className="text-[10px] font-medium">Início</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-white transition-colors">
          <Compass size={22} />
          <span className="text-[10px] font-medium">Descobrir</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-white transition-colors">
          <Users size={22} />
          <span className="text-[10px] font-medium">Social</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-white transition-colors mt-auto">
          <User size={22} />
          <span className="text-[10px] font-medium">Perfil</span>
        </button>
      </nav>
    </aside>
  );
}
