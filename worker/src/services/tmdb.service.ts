import { z } from 'zod';

const TMDBSearchResultSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  name: z.string().optional(), // for tv series
  overview: z.string().optional(),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  vote_average: z.number().optional()
});

const TMDBResponseSchema = z.object({
  results: z.array(TMDBSearchResultSchema).optional()
});

export class TMDBService {
  constructor(private readonly readAccessToken: string) {}

  private async fetchTMDB(endpoint: string, queryParams: URLSearchParams): Promise<z.infer<typeof TMDBResponseSchema> | null> {
    const url = \`https://api.themoviedb.org/3\${endpoint}?\${queryParams.toString()}\`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': \`Bearer \${this.readAccessToken}\`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const parsed = TMDBResponseSchema.safeParse(data);
      if (parsed.success) {
        return parsed.data;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  public async searchMovie(title: string) {
    const params = new URLSearchParams({
      query: title,
      language: 'pt-BR',
      page: '1',
      include_adult: 'false'
    });
    
    const data = await this.fetchTMDB('/search/movie', params);
    return data?.results?.[0] || null;
  }

  public async searchSeries(title: string) {
    const params = new URLSearchParams({
      query: title,
      language: 'pt-BR',
      page: '1',
      include_adult: 'false'
    });
    
    const data = await this.fetchTMDB('/search/tv', params);
    return data?.results?.[0] || null;
  }
}
