import type { ChannelSummary, MediaType, TitleSummary } from '../../shared/catalog';

export type SidebarView = 'home' | 'channels' | 'search' | 'my-list';

export type AppView =
  | { type: 'home' }
  | { type: 'channels' }
  | { type: 'category'; title: string; category: string | undefined; mediaType: MediaType }
  | { type: 'title'; title: TitleSummary }
  | { type: 'channel'; channel: ChannelSummary }
  | { type: 'search'; query: string }
  | { type: 'my-list' };

export interface NavigationEntry {
  view: AppView;
  focusTarget: HTMLElement | null;
}
