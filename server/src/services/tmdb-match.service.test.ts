import assert from 'node:assert/strict';
import test from 'node:test';
import { findBestTmdbMatch } from './tmdb-match.service';
import { TMDBService } from './tmdb.service';
import type { TmdbSearchResult } from './tmdb.types';

function candidate(id: number, title: string, originalTitle = title): TmdbSearchResult {
  return {
    id,
    title,
    original_title: originalTitle,
    overview: '',
    popularity: 1,
    vote_count: 100,
  };
}

test('selects an exact normalized movie title over a partial match', () => {
  const match = findBestTmdbMatch('Cidade de Deus', 'movie', [
    candidate(2, 'Cidade'),
    candidate(1, 'Cidade de Deus'),
  ]);

  assert.ok(match);
  assert.equal(match.tmdbId, 1);
  assert.ok(match.confidence >= 0.9);
});

test('does not create a low-confidence match', () => {
  const match = findBestTmdbMatch('Uma Busca Muito Específica', 'series', [
    {
      id: 1,
      name: 'Documentário sobre oceanos',
      original_name: 'Ocean documentary',
      overview: '',
      popularity: 1,
      vote_count: 100,
    },
  ]);

  assert.equal(match, null);
});

test('treats an absent TMDB token as an unavailable service without throwing', async () => {
  const service = new TMDBService();

  assert.equal(service.isConfigured, false);
  assert.deepEqual(await service.searchMovies('Example Film'), { kind: 'unavailable' });
});
