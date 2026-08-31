export interface ParsedItem {
  id: string;
  name: string;
  thumb: string;
  fanart: string;
  category: string;
  contentType: string;
  info: string;
  internalId: string;
}

export interface ParsedChannel {
  id: string;
  name: string;
  thumb: string;
  category: string;
  internalId: string;
}

export function cleanTitle(raw: string | undefined | null): string {
  if (!raw) return '';
  let t = raw;
  t = t.replace(/\[\/?COLOR[^\]]*\]/gi, '');
  t = t.replace(/\[\/?B\]/gi, '');
  t = t.replace(/\[\/?I\]/gi, '');
  t = t.replace(/\[OnePlay\]/gi, '');
  t = t.replace(/\[Brazuca\]/gi, '');
  t = t.replace(/\|\|\|/g, '').replace(/\[CR\]/g, '\n').trim();
  return t;
}

export function decodePoster(url: string | undefined | null): string {
  if (!url) return '';
  const clean = url.trim();
  if (!clean || clean === '[object Object]') return '';
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
  try {
    const dec = atob(clean);
    if (dec.startsWith('http')) return dec;
  } catch {
    // Ignore error
  }
  return clean;
}

export class BrazucaParser {
  private classifyChannel(title: string): string {
    const t = (title || '').toLowerCase();
    if (['sportv', 'espn', 'futebol', 'ufc', 'tnt sports', 'premiere', 'combate', 'dazn', 'bandsports', 'nba'].some(k => t.includes(k))) return 'esportes';
    if (['globo', 'sbt', 'record', 'band', 'redetv', 'cultura'].some(k => t.includes(k))) return 'abertos';
    if (['filme', 'cine', 'hbo', 'telecine', 'axn', 'fox', 'megapix', 'paramount', 'warner', 'universal', 'sony'].some(k => t.includes(k))) return 'filmes';
    if (['news', 'notícia', 'noticia', 'cnn', 'bandnews', 'record news', 'globonews', 'jovem pan'].some(k => t.includes(k))) return 'noticias';
    if (['kids', 'cartoon', 'disney', 'nickelodeon', 'discovery kids', 'gloob', 'tooncast', 'nick jr'].some(k => t.includes(k))) return 'infantil';
    if (['discovery', 'history', 'animal planet', 'nat geo', 'national geographic', 'curta', 'h2', 'doc'].some(k => t.includes(k))) return 'docs';
    if (['multishow', 'viva', 'mtv', 'gnt', 'bis', 'comedy central', 'tlc', 'e!'].some(k => t.includes(k))) return 'variedades';
    return 'outros';
  }

  public async fetchChannels(url: string): Promise<ParsedChannel[]> {
    const out: ParsedChannel[] = [];
    try {
      const resp = await fetch(url);
      if (!resp.ok) return [];
      const rawText = await resp.text();

      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      while ((match = itemRegex.exec(rawText)) !== null) {
        const itemStr = match[1];
        if (!itemStr) continue;

        const titleM = itemStr.match(/<(?:title|name)>([\s\S]*?)<\/(?:title|name)>/);
        if (!titleM || !titleM[1]) continue;
        const rawTitle = cleanTitle(titleM[1]);
        if (!rawTitle || rawTitle.startsWith("|||")) continue;

        const linkM = itemStr.match(/<link>([\s\S]*?)<\/link>/);
        const linkVal = (linkM && linkM[1]) ? linkM[1].trim() : '';

        const thumbM = itemStr.match(/<(?:thumbnail|poster)>([\s\S]*?)<\/(?:thumbnail|poster)>/);
        const thumbVal = decodePoster((thumbM && thumbM[1]) ? thumbM[1].trim() : '');

        let finalId = linkVal;
        if (linkVal.startsWith('chresolver1=')) {
          const parts = linkVal.replace('chresolver1=', '').split('#');
          if (parts[0]) {
            finalId = parts[0];
          }
        }

        if (finalId) {
          out.push({
            id: `br_${out.length + 1}`,
            name: rawTitle,
            thumb: thumbVal,
            category: this.classifyChannel(rawTitle),
            internalId: finalId as string
          });
        }
      }
    } catch (e) {
      console.error('[Channels] Error: ', e);
    }
    return out;
  }

  public async fetchVod(url: string, category: string, contentType: string, startId: number = 0): Promise<ParsedItem[]> {
    const itemsOut: ParsedItem[] = [];
    try {
      const resp = await fetch(url);
      if (!resp.ok) return [];
      const rawText = await resp.text();
      
      const itemRegex = /<(?:channel|item)>([\s\S]*?)<\/(?:channel|item)>/g;
      let match;
      while ((match = itemRegex.exec(rawText)) !== null) {
        const itemStr = match[1];
        if (!itemStr) continue;
        
        const nameM = itemStr.match(/<(?:name|title)>([\s\S]*?)<\/(?:name|title)>/);
        if (!nameM || !nameM[1]) continue;
        const rawName = cleanTitle(nameM[1]);
        if (!rawName) continue;

        const linkM = itemStr.match(/<(?:externallink|link)>([\s\S]*?)<\/(?:externallink|link)>/);
        const linkVal = (linkM && linkM[1]) ? linkM[1].trim() : '';

        const isPagination = linkVal.startsWith('http') && (
          rawName.toUpperCase().includes('PRÓXIMA PÁGINA') ||
          rawName.toUpperCase().includes('PRÃ“XIMA PÃ GINA') ||
          rawName.toUpperCase().includes('PROXIMA PAGINA') ||
          /pr[óoã\w]*xima\s+p[áaã\w]*g/i.test(rawName)
        );

        if (isPagination) {
          const nextItems = await this.fetchVod(linkVal, category, contentType, startId + itemsOut.length);
          itemsOut.push(...nextItems);
          continue;
        }
        
        if (!linkVal || linkVal.toLowerCase() === 'here') continue;

        const thumbM = itemStr.match(/<(?:thumbnail|poster|img)>([\s\S]*?)<\/(?:thumbnail|poster|img)>/);
        const thumbVal = decodePoster((thumbM && thumbM[1]) ? thumbM[1].trim() : '');
        
        const fanartM = itemStr.match(/<(?:fanart|backdrop|cover)>([\s\S]*?)<\/(?:fanart|backdrop|cover)>/);
        const fanartVal = decodePoster((fanartM && fanartM[1]) ? fanartM[1].trim() : '') || thumbVal;
        
        const infoM = itemStr.match(/<info>([\s\S]*?)<\/info>/);
        const infoVal = cleanTitle((infoM && infoM[1]) ? infoM[1] : '');

        let finalId = linkVal;
        if (linkVal.startsWith('#')) {
          const parts = linkVal.split('=');
          if (parts.length > 1 && parts[1]) {
            finalId = parts[1];
          }
        }

        itemsOut.push({
          id: `vod_${startId + itemsOut.length + 1}`,
          name: rawName,
          thumb: thumbVal,
          fanart: fanartVal,
          category,
          contentType,
          info: infoVal,
          internalId: finalId
        });
      }
    } catch (e) {
      console.error(`[VOD] Error downloading ${category}: `, e);
    }
    return itemsOut;
  }
}
