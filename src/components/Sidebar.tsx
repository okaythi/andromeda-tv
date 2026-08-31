import { Bookmark, Home, Search, Tv, type LucideIcon } from 'lucide-react';
import type { SidebarView } from '../navigation/types';

interface SidebarProps {
  currentView: SidebarView;
  onViewChange: (view: SidebarView, trigger: HTMLElement) => void;
}

interface NavigationItem {
  id: SidebarView;
  label: string;
  icon: LucideIcon;
}

const navigationItems: NavigationItem[] = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'channels', label: 'Canais', icon: Tv },
  { id: 'search', label: 'Buscar', icon: Search },
  { id: 'my-list', label: 'Minha lista', icon: Bookmark },
];

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <aside className="z-40 flex w-[76px] flex-shrink-0 flex-col items-center border-r border-white/5 bg-[#0A0A0A] py-6 sm:w-24">
      <div className="mb-10 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-red-500 shadow-lg shadow-purple-900/30">
        <span aria-hidden="true" className="text-lg font-black text-white">A</span>
        <span className="sr-only">Andromeda TV</span>
      </div>
      <nav aria-label="Navegação principal" className="flex w-full flex-col gap-3 px-2 sm:gap-5 sm:px-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={(event) => onViewChange(item.id, event.currentTarget)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-[10px] font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                isActive ? 'bg-white/10 text-white' : 'text-zinc-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={21} aria-hidden="true" />
              <span className="hidden sm:block">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
