
import { Search, Mic, Bell } from 'lucide-react';

export function Header() {
  return (
    <header className="relative z-10 flex justify-between items-center px-12 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Andromeda TV</h1>

      <div className="flex items-center gap-6">
        <div className="flex items-center bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 w-80">
          <input
            type="text"
            placeholder="Pesquisar"
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400 text-white"
          />
          <Mic size={16} className="text-gray-400 mx-2 cursor-pointer hover:text-white" />
          <Search size={16} className="text-gray-400 cursor-pointer hover:text-white" />
        </div>
        <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors">
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}
