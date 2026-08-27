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
      } catch (e) {
        // Continue trying other master URLs
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
            accounts[`master_${user}`] = { baseUrl, user, pass: pwd };
            console.log(`[OnePlay] Active server detected: ${baseUrl} (${user})`);
          }
        }
      } catch (e) {
        // Safe to ignore individual dead servers
      }
    });

    await Promise.allSettled(checkPromises);
    
    if (Object.keys(accounts).length === 0) {
      throw new Error("OnePlay Sync Failed: No active accounts found.");
    }
    
    return accounts;
  }

  public async fetchVod(accounts: Record<string, OnePlayAccount>): Promise<{ movies: ParsedItem[], series: ParsedItem[] }> {
    const movies: ParsedItem[] = [];
    const series: ParsedItem[] = [];

    const fetchPromises = Object.values(accounts).map(async (acc) => {
      const accB64 = btoa(JSON.stringify(acc));

      // Movies
      const mUrl = `${acc.baseUrl}/player_api.php?username=${acc.user}&password=${acc.pass}&action=get_vod_streams`;
      const mResp = await fetch(mUrl);
      if (!mResp.ok) throw new Error(`Failed to fetch OnePlay movies for ${acc.user}: HTTP ${mResp.status}`);
      
      const mData = await mResp.json();
      if (Array.isArray(mData)) {
        for (const m of mData) {
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

      // Series
      const sUrl = `${acc.baseUrl}/player_api.php?username=${acc.user}&password=${acc.pass}&action=get_series`;
      const sResp = await fetch(sUrl);
      if (!sResp.ok) throw new Error(`Failed to fetch OnePlay series for ${acc.user}: HTTP ${sResp.status}`);
      
      const sData = await sResp.json();
      if (Array.isArray(sData)) {
        for (const s of sData) {
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
    });

    const results = await Promise.allSettled(fetchPromises);
    const failures = results.filter(r => r.status === 'rejected');
    
    if (failures.length === results.length && results.length > 0) {
      // If all accounts failed, throw the first error
      throw (failures[0] as PromiseRejectedResult).reason;
    }

    return { movies, series };
  }
}
