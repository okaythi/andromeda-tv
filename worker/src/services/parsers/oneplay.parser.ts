import { ParsedItem, cleanTitle, decodePoster } from './brazuca.parser';

export interface OnePlayAccount {
  baseUrl: string;
  user: string;
  pass: string;
}

export class OnePlayParser {
  public async syncOnePlayAccounts(): Promise<Record<string, OnePlayAccount>> {
    const accounts: Record<string, OnePlayAccount> = {};
    const masterUrls = [
      "https://oneplayhd.com/listas_oneplay/master.txt",
      "https://listas.oneplayhd.com/master.txt"
    ];
    const listUrls = new Set<string>();

    for (const mUrl of masterUrls) {
      try {
        const resp = await fetch(mUrl);
        if (resp.ok) {
          const text = await resp.text();
          const found = text.match(/https?:\/\/[^\s"'<>]+/g);
          if (found) {
            found.forEach(f => listUrls.add(f.trim()));
          }
        }
      } catch {
        // ignore
      }
    }

    if (listUrls.size === 0) {
      for (let i = 1; i <= 8; i++) {
        listUrls.add(`https://listas.oneplayhd.com/lista0${i}.txt`);
      }
    }

    const checkPromises = Array.from(listUrls).map(async (url) => {
      try {
        const resp = await fetch(url);
        if (!resp.ok) return;
        const text = await resp.text();
        const match = text.match(/http:\/\/([^/]+)\/xmltv\.php\?username=([^&]+)&password=([^"\r\n]+)/);
        if (match) {
          const baseUrl = `http://${match[1] || ''}`;
          const user = (match[2] || '').trim();
          const pwd = (match[3] || '').trim();
          
          const testUrl = `${baseUrl}/player_api.php?username=${user}&password=${pwd}`;
          const tResp = await fetch(testUrl);
          if (tResp.ok) {
            const text = await tResp.text();
            if (text.trim().startsWith('{')) {
              try {
                const j = JSON.parse(text);
                if (j && (j.user_info || j.server_info || j.auth === 1)) {
                  accounts[`master_${user}`] = { baseUrl, user, pass: pwd };
                  console.log(`[OnePlay] Active server detected: ${baseUrl} (${user})`);
                }
              } catch {
                // Ignore
              }
            }
          }
        }
      } catch {
        // ignore
      }
    });

    await Promise.allSettled(checkPromises);
    return accounts;
  }

  public async fetchVod(accounts: Record<string, OnePlayAccount>): Promise<{ movies: ParsedItem[], series: ParsedItem[] }> {
    const movies: ParsedItem[] = [];
    const series: ParsedItem[] = [];

    const fetchPromises = Object.values(accounts).map(async (acc) => {
      const accB64 = btoa(JSON.stringify(acc));

      // Movies
      try {
        const mUrl = `${acc.baseUrl}/player_api.php?username=${acc.user}&password=${acc.pass}&action=get_vod_streams`;
        const mResp = await fetch(mUrl);
        if (mResp.ok) {
          const data = await mResp.json();
          if (Array.isArray(data)) {
            for (const m of data) {
              const name = cleanTitle(m.name || "");
              const s_id = m.stream_id;
              const ext = m.container_extension || "mp4";
              if (name && s_id) {
                movies.push({
                  id: `op_m_${s_id}`,
                  name,
                  thumb: decodePoster(m.stream_icon),
                  fanart: decodePoster(m.stream_icon),
                  category: "Filmes",
                  contentType: "movie",
                  info: `Rating: ${m.rating || '8.0'}`,
                  internalId: `opmovie_${accB64}_${s_id}_${ext}`
                });
              }
            }
          }
        }
      } catch {}

      // Series
      try {
        const sUrl = `${acc.baseUrl}/player_api.php?username=${acc.user}&password=${acc.pass}&action=get_series`;
        const sResp = await fetch(sUrl);
        if (sResp.ok) {
          const data = await sResp.json();
          if (Array.isArray(data)) {
            for (const s of data) {
              const name = cleanTitle(s.name || "");
              const series_id = s.series_id;
              if (name && series_id) {
                series.push({
                  id: `op_s_${series_id}`,
                  name,
                  thumb: decodePoster(s.cover),
                  fanart: decodePoster(s.cover),
                  category: "Séries",
                  contentType: "tv",
                  info: cleanTitle(s.plot || ""),
                  internalId: `opseries_${accB64}_${series_id}`
                });
              }
            }
          }
        }
      } catch {}
    });

    await Promise.allSettled(fetchPromises);
    return { movies, series };
  }
}
