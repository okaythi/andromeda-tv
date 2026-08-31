import { createContext } from 'react';
import type { TitleSummary } from '../../../shared/catalog';
import type { FavoriteTitle } from './favorite.types';

export interface FavoritesContextValue {
  favorites: FavoriteTitle[];
  isFavorite: (title: Pick<TitleSummary, 'id' | 'mediaType'>) => boolean;
  toggleFavorite: (title: TitleSummary) => void;
  removeFavorite: (title: Pick<TitleSummary, 'id' | 'mediaType'>) => void;
}

export const FavoritesContext = createContext<FavoritesContextValue | null>(null);
