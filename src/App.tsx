import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChannelSummary, MediaType, TitleSummary } from '../shared/catalog';
import { Header } from './components/Header';
import { PlaybackAvailabilityDialog } from './components/detail/PlaybackAvailabilityDialog';
import { Sidebar } from './components/Sidebar';
import { FavoritesProvider } from './features/favorites/FavoritesContext';
import { useBackNavigation } from './hooks/useBackNavigation';
import { AppViewRenderer } from './navigation/AppViewRenderer';
import { documentTitleFor } from './navigation/document-title';
import type { SidebarView } from './navigation/types';
import { useAppNavigation } from './navigation/useAppNavigation';
import type { ViewActions } from './navigation/view-actions';

interface PlaybackRequest {
  title: string;
  focusTarget: HTMLElement;
}

function sidebarViewFor(viewType: string): SidebarView {
  if (viewType === 'channels' || viewType === 'channel') return 'channels';
  if (viewType === 'search') return 'search';
  if (viewType === 'my-list') return 'my-list';
  return 'home';
}

function AppContent() {
  const { currentView, canGoBack, navigate, resetTo, back } = useAppNavigation();
  const [playbackRequest, setPlaybackRequest] = useState<PlaybackRequest | null>(null);

  const handleBack = useCallback(() => {
    if (canGoBack) {
      back();
      return;
    }
    resetTo('home');
  }, [back, canGoBack, resetTo]);

  const openTitle = useCallback((title: TitleSummary, trigger: HTMLElement) => {
    navigate({ type: 'title', title }, trigger);
  }, [navigate]);

  const openChannel = useCallback((channel: ChannelSummary, trigger: HTMLElement) => {
    navigate({ type: 'channel', channel }, trigger);
  }, [navigate]);

  const openCategory = useCallback((
    title: string,
    category: string | undefined,
    mediaType: MediaType,
    trigger: HTMLElement,
  ) => {
    navigate({ type: 'category', title, category, mediaType }, trigger);
  }, [navigate]);

  const openChannels = useCallback((trigger: HTMLElement) => {
    navigate({ type: 'channels' }, trigger);
  }, [navigate]);

  const openSearch = useCallback((query: string, trigger: HTMLElement) => {
    navigate({ type: 'search', query }, trigger);
  }, [navigate]);

  const requestPlayback = useCallback((title: string, trigger: HTMLElement) => {
    setPlaybackRequest({ title, focusTarget: trigger });
  }, []);

  const closePlaybackRequest = useCallback(() => {
    const focusTarget = playbackRequest?.focusTarget ?? null;
    setPlaybackRequest(null);
    window.requestAnimationFrame(() => {
      if (focusTarget?.isConnected) focusTarget.focus();
    });
  }, [playbackRequest]);

  const viewActions = useMemo<ViewActions>(() => ({
    onBack: handleBack,
    onOpenTitle: openTitle,
    onOpenChannel: openChannel,
    onOpenCategory: openCategory,
    onOpenChannels: openChannels,
    onRequestPlayback: requestPlayback,
  }), [handleBack, openCategory, openChannel, openChannels, openTitle, requestPlayback]);

  useBackNavigation(handleBack, canGoBack && playbackRequest === null);

  useEffect(() => {
    document.title = documentTitleFor(currentView);
  }, [currentView]);

  return (
    <div className="flex h-dvh overflow-hidden bg-[#0A0A0A] font-sans text-white">
      <Sidebar currentView={sidebarViewFor(currentView.type)} onViewChange={resetTo} />
      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header onSearch={openSearch} />
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          <AppViewRenderer view={currentView} actions={viewActions} />
        </div>
      </main>
      {playbackRequest && (
        <PlaybackAvailabilityDialog title={playbackRequest.title} onClose={closePlaybackRequest} />
      )}
    </div>
  );
}

function App() {
  return (
    <FavoritesProvider>
      <AppContent />
    </FavoritesProvider>
  );
}

export default App;
