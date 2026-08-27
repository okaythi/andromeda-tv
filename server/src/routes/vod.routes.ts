import { Hono } from 'hono';
import { db } from '../db';
import { movies, series } from '../schema';

const vodRouter = new Hono();

vodRouter.get('/movies', async (c) => {
  const page = Number(c.req.query('page')) || 1;
  const pageSize = Number(c.req.query('limit')) || 50;
  
  const results = await db.select()
    .from(movies)
    .limit(pageSize)
    .offset((page - 1) * pageSize);
    
  return c.json({
    page,
    limit: pageSize,
    total: results.length, // Should use a count query for absolute total
    movies: results
  });
});

vodRouter.get('/series', async (c) => {
  const page = Number(c.req.query('page')) || 1;
  const pageSize = Number(c.req.query('limit')) || 50;
  
  const results = await db.select()
    .from(series)
    .limit(pageSize)
    .offset((page - 1) * pageSize);
    
  return c.json({
    page,
    limit: pageSize,
    total: results.length,
    series: results
  });
});

const episodeCache = new Map<string, { response: Response, expiry: number }>();

vodRouter.get('/episodes/:internalId', async (c) => {
  const internalId = c.req.param('internalId') || '';
  const cacheKey = c.req.url;

  const cached = episodeCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return cached.response.clone();
  }

  let payload = {};
  if (internalId.startsWith('opseries_')) {
    const parts = internalId.split('_');
    if (parts.length >= 3) {
      const accB64 = parts[1];
      const seriesId = parts[2];
      try {
        const acc = JSON.parse(atob(accB64 || ''));
        const opUrl = `${acc.baseUrl}/player_api.php?username=${acc.user}&password=${acc.pass}&action=get_series_info&series_id=${seriesId}`;
        const opResp = await fetch(opUrl);
        if (opResp.ok) {
          const data: any = await opResp.json();
          const episodesData: any = {};
          if (data.episodes) {
            for (const [season, eps] of Object.entries(data.episodes)) {
              episodesData[season] = { episodes: {} };
              for (const ep of eps as any[]) {
                const epNum = String(ep.episode_num || 1);
                episodesData[season].episodes[epNum] = {
                  title: ep.title || `Episode ${epNum}`,
                  resolver2_link: `opseries#${accB64}#${ep.id}#${ep.container_extension || 'mp4'}`
                };
              }
            }
          }
          payload = { resolver_type: 2, data: episodesData };
        }
      } catch (e) {}
    }
  } else {
    // GeekAntenado logic
    try {
      let resolverType = 3;
      let queryType = "tvshows";
      let rawId = internalId.split('|')[0] || '';

      if (rawId.startsWith("resolver2_tvshows=")) {
        resolverType = 2;
        rawId = rawId.replace("resolver2_tvshows=", "");
        if (!rawId.includes("#")) rawId = `serie#${rawId}`;
      } else if (rawId.startsWith("resolver3_tvshows=")) {
        rawId = rawId.replace("resolver3_tvshows=", "");
      } else if (rawId.startsWith("serie3=")) {
        rawId = rawId.replace("serie3=", "");
      } else if (rawId.startsWith("animes3=")) {
        queryType = "animes";
        rawId = rawId.replace("animes3=", "");
      } else if (rawId.startsWith("doramas_resolver1=")) {
        queryType = "doramas";
        rawId = rawId.replace("doramas_resolver1=", "");
      }

      const paramsStr = JSON.stringify({ resolver: resolverType, request: `${queryType}=${rawId}` });
      const b64Payload = btoa(paramsStr);
      const apiUrl = `https://api.geekantenado.online/?resolver=${encodeURIComponent(b64Payload)}`;

      const geekToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJyZXNvbHZlciIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzc5MDk4OTczfQ.WzQBuOqMai96Afleh9g-i7NXo6h-YsjPUbOgxlUqVsU";
      
      const geekResp = await fetch(apiUrl, {
        headers: {
          "Authorization": `Bearer ${geekToken}`,
          "User-Agent": "Mozilla/5.0"
        }
      });

      if (geekResp.ok) {
        const data: any = await geekResp.json();
        if (data.result) {
          let resStr = atob(data.result);
          resStr = resStr.replace(/'/g, '"').replace(/True/g, "true").replace(/False/g, "false").replace(/None/g, "null");
          payload = { resolver_type: resolverType, data: JSON.parse(resStr) };
        }
      }
    } catch (e) {}
  }

  const response = new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=3600',
      'Access-Control-Allow-Origin': '*'
    }
  });

  episodeCache.set(cacheKey, { response: response.clone(), expiry: Date.now() + 3600 * 1000 });

  return response;
});

export { vodRouter };
