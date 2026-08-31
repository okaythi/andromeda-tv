import type { MediaType, TitleSummary } from '../../../shared/catalog';
import {
  asArray,
  asRecord,
  nullableNumber,
  nullableString,
  requiredString,
} from '../../api/json';
import type { FavoriteTitle } from './favorite.types';

const FAVORITES_STORAGE_KEY = 'andromeda:favorites:v1';

function parseMediaType(value: unknown): MediaType | null {
  return value === 'movie' || value === 'series' ? value : null;
}

function parseFavorite(value: unknown): FavoriteTitle | null {
  try {
    const record = asRecord(value, 'favorite');
    const mediaType = parseMediaType(record['mediaType']);
    if (!mediaType) return null;

    return {
      id: requiredString(record, 'id', 'favorite'),
      mediaType,
      title: requiredString(record, 'title', 'favorite'),
      overview: requiredString(record, 'overview', 'favorite'),
      posterUrl: nullableString(record, 'posterUrl', 'favorite'),
      backdropUrl: nullableString(record, 'backdropUrl', 'favorite'),
      rating: nullableString(record, 'rating', 'favorite'),
      tmdbId: nullableNumber(record, 'tmdbId', 'favorite'),
      category: requiredString(record, 'category', 'favorite'),
      addedAt: requiredString(record, 'addedAt', 'favorite'),
    };
  } catch {
    return null;
  }
}

export function loadFavorites(): FavoriteTitle[] {
  try {
    const storedValue = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!storedValue) return [];
    const payload: unknown = JSON.parse(storedValue);
    return asArray(payload, 'favorites')
      .map(parseFavorite)
      .filter((favorite): favorite is FavoriteTitle => favorite !== null)
      .sort((left, right) => right.addedAt.localeCompare(left.addedAt));
  } catch {
    return [];
  }
}

export function saveFavorites(favorites: FavoriteTitle[]): void {
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // The UI remains usable when persistent storage is unavailable.
  }
}

export function toFavorite(title: TitleSummary): FavoriteTitle {
  return { ...title, addedAt: new Date().toISOString() };
}
