import { AlertCircle, CheckCircle2, RefreshCw, Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useSyncStatus } from '../hooks/useSyncStatus';

interface HeaderProps {
  onSearch: (query: string, trigger: HTMLElement) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const status = useSyncStatus();
  const [query, setQuery] = useState('');
  const statusLabel = status.lastError
    ? `Erro de sincronização: ${status.lastError}`
    : status.isSyncing
      ? 'Sincronizando catálogos'
      : status.isEnriching
        ? 'Atualizando metadados'
        : status.lastSuccess
          ? 'Catálogo atualizado'
          : 'Status do catálogo indisponível';

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedQuery = query.trim();
    if (normalizedQuery.length >= 2) onSearch(normalizedQuery, event.currentTarget);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-5 border-b border-white/5 bg-[#0A0A0A]/90 px-5 py-5 backdrop-blur-xl sm:px-12">
      <div className="flex min-w-0 items-center gap-3">
        <h1 className="truncate text-xl font-bold tracking-tight text-white sm:text-2xl">Andromeda TV</h1>
        <span className="inline-flex" title={statusLabel} aria-label={statusLabel}>
          {status.lastError ? (
            <AlertCircle size={16} className="text-red-400" aria-hidden="true" />
          ) : status.isSyncing || status.isEnriching ? (
            <RefreshCw size={16} className="animate-spin text-blue-300" aria-hidden="true" />
          ) : status.lastSuccess ? (
            <CheckCircle2 size={16} className="text-emerald-400" aria-hidden="true" />
          ) : null}
        </span>
      </div>
      <form onSubmit={submitSearch} className="flex w-full max-w-md items-center rounded-full border border-white/10 bg-black/40 px-4 py-2 focus-within:border-white/30">
        <label htmlFor="catalog-search" className="sr-only">Pesquisar no catálogo</label>
        <input
          id="catalog-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          type="search"
          minLength={2}
          placeholder="Pesquisar títulos e canais"
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
        />
        <button
          type="submit"
          aria-label="Pesquisar"
          disabled={query.trim().length < 2}
          className="ml-2 rounded-full p-1 text-zinc-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Search size={18} aria-hidden="true" />
        </button>
      </form>
    </header>
  );
}
