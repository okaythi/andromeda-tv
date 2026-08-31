import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { TitleSummary } from '../../../shared/catalog';
import { FavoritesContext, type FavoritesContextValue } from './favorites-context';
import { favoriteKey, type FavoriteTitle } from './favorite.types';
import { loadFavorites, saveFavorites, toFavorite } from './favorite-storage';

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [favorites, setFavorites] = useState<FavoriteTitle[]>(loadFavorites);

  const persist = useCallback((nextFavorites: FavoriteTitle[]) => {
    setFavorites(nextFavorites);
    saveFavorites(nextFavorites);
  }, []);

  const isFavorite = useCallback((title: Pick<TitleSummary, 'id' | 'mediaType'>) => (
    favorites.some((favorite) => favoriteKey(favorite) === favoriteKey(title))
  ), [favorites]);

  const toggleFavorite = useCallback((title: TitleSummary) => {
    const key = favoriteKey(title);
    const existing = favorites.find((favorite) => favoriteKey(favorite) === key);
    persist(existing
      ? favorites.filter((favorite) => favoriteKey(favorite) !== key)
      : [toFavorite(title), ...favorites]);
  }, [favorites, persist]);

  const removeFavorite = useCallback((title: Pick<TitleSummary, 'id' | 'mediaType'>) => {
    const key = favoriteKey(title);
    persist(favorites.filter((favorite) => favoriteKey(favorite) !== key));
  }, [favorites, persist]);

  const value = useMemo<FavoritesContextValue>(() => ({
    favorites,
    isFavorite,
    toggleFavorite,
    removeFavorite,
  }), [favorites, isFavorite, removeFavorite, toggleFavorite]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
