import type { ChannelSummary, MediaType, TitleSummary } from '../../shared/catalog';

export interface ViewActions {
  onBack: () => void;
  onOpenTitle: (title: TitleSummary, trigger: HTMLElement) => void;
  onOpenChannel: (channel: ChannelSummary, trigger: HTMLElement) => void;
  onOpenCategory: (
    title: string,
    category: string | undefined,
    mediaType: MediaType,
    trigger: HTMLElement,
  ) => void;
  onOpenChannels: (trigger: HTMLElement) => void;
  onRequestPlayback: (title: string, trigger: HTMLElement) => void;
}
