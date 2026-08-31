import type { MediaType } from '../../../shared/catalog';
import type { TmdbSearchResult } from './tmdb.types';

const MINIMUM_MATCH_CONFIDENCE = 0.72;

export interface TmdbMatch {
  tmdbId: number;
  confidence: number;
  candidate: TmdbSearchResult;
}

function normalizeTitle(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/\[[^\]]*]/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokenSet(value: string): Set<string> {
  return new Set(normalizeTitle(value).split(' ').filter((token) => token.length > 1));
}

function tokenSimilarity(left: string, right: string): number {
  const leftTokens = tokenSet(left);
  const rightTokens = tokenSet(right);
  if (leftTokens.size === 0 || rightTokens.size === 0) return 0;

  let commonTokens = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) commonTokens += 1;
  }

  return commonTokens / Math.max(leftTokens.size, rightTokens.size);
}

function candidateTitles(candidate: TmdbSearchResult, mediaType: MediaType): string[] {
  const preferred = mediaType === 'movie' ? candidate.title : candidate.name;
  const original = mediaType === 'movie' ? candidate.original_title : candidate.original_name;
  return [preferred, original].filter((value): value is string => Boolean(value?.trim()));
}

function scoreCandidate(sourceTitle: string, candidate: TmdbSearchResult, mediaType: MediaType): number {
  const source = normalizeTitle(sourceTitle);
  if (!source) return 0;

  const titleScore = Math.max(
    ...candidateTitles(candidate, mediaType).map((title) => {
      const normalizedCandidate = normalizeTitle(title);
      if (normalizedCandidate === source) return 1;
      const overlap = tokenSimilarity(source, normalizedCandidate);
      const prefixBonus = normalizedCandidate.startsWith(source) || source.startsWith(normalizedCandidate) ? 0.08 : 0;
      return Math.min(overlap + prefixBonus, 0.95);
    }),
    0,
  );

  const popularityBonus = candidate.vote_count && candidate.vote_count > 20 ? 0.02 : 0;
  return Math.min(titleScore + popularityBonus, 1);
}

export function findBestTmdbMatch(
  sourceTitle: string,
  mediaType: MediaType,
  candidates: TmdbSearchResult[],
): TmdbMatch | null {
  let bestMatch: TmdbMatch | null = null;

  for (const candidate of candidates) {
    const confidence = scoreCandidate(sourceTitle, candidate, mediaType);
    if (!bestMatch || confidence > bestMatch.confidence) {
      bestMatch = { tmdbId: candidate.id, confidence, candidate };
    }
  }

  return bestMatch && bestMatch.confidence >= MINIMUM_MATCH_CONFIDENCE ? bestMatch : null;
}
