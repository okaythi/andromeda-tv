import type { TitleSummary } from '../../../shared/catalog';

export interface FavoriteTitle extends TitleSummary {
  addedAt: string;
}

export function favoriteKey(title: Pick<TitleSummary, 'id' | 'mediaType'>): string {
  return `${title.mediaType}:${title.id}`;
}
