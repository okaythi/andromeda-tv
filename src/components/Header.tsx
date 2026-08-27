import { Search, Mic, Bell, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSyncStatus } from '../hooks/useSyncStatus';

export function Header() {
  const status = useSyncStatus();

  return (
    <header className="relative z-10 flex justify-between items-center px-12 py-8">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Andromeda TV</h1>
        
        {/* Sync Indicator */}
        <div className="flex items-center" title={status.lastError ? `Sync Error: ${status.lastError}` : (status.isSyncing ? 'Syncing catalogs...' : (status.isEnriching ? 'Enriching metadata...' : 'Up to date'))}>
          {status.lastError ? (
            <AlertCircle size={16} className="text-red-500" />
          ) : status.isSyncing || status.isEnriching ? (
            <RefreshCw size={16} className="text-blue-400 animate-spin" />
          ) : status.lastSuccess ? (
            <CheckCircle2 size={16} className="text-green-500/50" />
          ) : null}
        </div>
      </div>

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
