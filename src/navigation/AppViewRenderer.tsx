import type { AppView } from './types';
import type { ViewActions } from './view-actions';
import { ChannelDetailView } from '../views/ChannelDetailView';
import { ChannelsGrid } from '../views/ChannelsGrid';
import { HomeView } from '../views/HomeView';
import { MoviesGrid } from '../views/MoviesGrid';
import { MyListView } from '../views/MyListView';
import { SearchView } from '../views/SearchView';
import { TitleDetailView } from '../views/TitleDetailView';

interface AppViewRendererProps {
  view: AppView;
  actions: ViewActions;
}

export function AppViewRenderer({ view, actions }: AppViewRendererProps) {
  switch (view.type) {
    case 'home':
      return (
        <HomeView
          onViewChannels={actions.onOpenChannels}
          onViewCategory={actions.onOpenCategory}
          onOpenTitle={actions.onOpenTitle}
          onOpenChannel={actions.onOpenChannel}
          onWatchTitle={(title, trigger) => actions.onRequestPlayback(title.title, trigger)}
        />
      );
    case 'channels':
      return <ChannelsGrid onBack={actions.onBack} onOpenChannel={actions.onOpenChannel} />;
    case 'category':
      return (
        <MoviesGrid
          title={view.title}
          category={view.category}
          mediaType={view.mediaType}
          onBack={actions.onBack}
          onOpenTitle={actions.onOpenTitle}
        />
      );
    case 'title':
      return (
        <TitleDetailView
          title={view.title}
          onBack={actions.onBack}
          onOpenTitle={actions.onOpenTitle}
          onWatch={(title, trigger) => actions.onRequestPlayback(title.title, trigger)}
        />
      );
    case 'channel':
      return <ChannelDetailView channel={view.channel} onBack={actions.onBack} onWatch={actions.onRequestPlayback} />;
    case 'search':
      return <SearchView query={view.query} onBack={actions.onBack} onOpenTitle={actions.onOpenTitle} onOpenChannel={actions.onOpenChannel} />;
    case 'my-list':
      return <MyListView onBack={actions.onBack} onOpenTitle={actions.onOpenTitle} />;
  }
}
