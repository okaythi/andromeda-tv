import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AppView, NavigationEntry, SidebarView } from './types';

const INITIAL_ENTRY: NavigationEntry = {
  view: { type: 'home' },
  focusTarget: null,
};

function sidebarTarget(view: SidebarView): AppView {
  switch (view) {
    case 'home':
      return { type: 'home' };
    case 'channels':
      return { type: 'channels' };
    case 'search':
      return { type: 'search', query: '' };
    case 'my-list':
      return { type: 'my-list' };
  }
}

export function useAppNavigation() {
  const [entries, setEntries] = useState<NavigationEntry[]>([INITIAL_ENTRY]);
  const entriesRef = useRef(entries);
  const pendingFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  useEffect(() => {
    const focusTarget = pendingFocusRef.current;
    pendingFocusRef.current = null;
    if (focusTarget?.isConnected) focusTarget.focus();
  }, [entries]);

  const navigate = useCallback((view: AppView, focusTarget: HTMLElement | null = null) => {
    const nextEntries = [...entriesRef.current, { view, focusTarget }];
    entriesRef.current = nextEntries;
    setEntries(nextEntries);
  }, []);

  const resetTo = useCallback((view: SidebarView, focusTarget: HTMLElement | null = null) => {
    const nextEntries: NavigationEntry[] = [{ view: sidebarTarget(view), focusTarget }];
    entriesRef.current = nextEntries;
    setEntries(nextEntries);
  }, []);

  const back = useCallback(() => {
    const currentEntries = entriesRef.current;
    if (currentEntries.length <= 1) return;

    const currentEntry = currentEntries.at(-1);
    pendingFocusRef.current = currentEntry?.focusTarget ?? null;
    const nextEntries = currentEntries.slice(0, -1);
    entriesRef.current = nextEntries;
    setEntries(nextEntries);
  }, []);

  return useMemo(() => ({
    currentView: entries.at(-1)?.view ?? INITIAL_ENTRY.view,
    canGoBack: entries.length > 1,
    navigate,
    resetTo,
    back,
  }), [back, entries, navigate, resetTo]);
}
