import { z } from 'zod';
import { XMLParser } from 'fast-xml-parser';

export const ParsedItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  thumb: z.string(),
  fanart: z.string(),
  category: z.string(),
  contentType: z.string(),
  info: z.string(),
  internalId: z.string(),
});
export type ParsedItem = z.infer<typeof ParsedItemSchema>;

export const ParsedChannelSchema = z.object({
  id: z.string(),
  name: z.string(),
  thumb: z.string(),
  category: z.string(),
  internalId: z.string(),
});
export type ParsedChannel = z.infer<typeof ParsedChannelSchema>;

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

function ensureArray(val: unknown): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return [val];
}

export class BrazucaParser {
  private parser = new XMLParser({
    ignoreAttributes: true,
    parseTagValue: false, // keep everything as strings
  });

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

  private extractItems(jsonObj: any): any[] {
    const foundItems: any[] = [];
    
    function search(obj: any) {
      if (!obj || typeof obj !== 'object') return;
      
      if (obj.item) foundItems.push(...ensureArray(obj.item));
      if (obj.channel) {
         const channels = ensureArray(obj.channel);
         channels.forEach(c => {
           if (c.item) foundItems.push(...ensureArray(c.item));
           else foundItems.push(c);
         });
      }
  
      for (const key of Object.keys(obj)) {
         if (key !== 'item' && key !== 'channel' && typeof obj[key] === 'object') {
             search(obj[key]);
         }
      }
    }
    
    search(jsonObj);
    return foundItems;
  }

  public async fetchChannels(url: string): Promise<ParsedChannel[]> {
    const out: ParsedChannel[] = [];
    try {
      const resp = await fetch(url);
      if (!resp.ok) return [];
      const rawText = await resp.text();
      const jsonObj = this.parser.parse(rawText);
      const items = this.extractItems(jsonObj);

      for (const item of items) {
        const rawTitle = cleanTitle(item.title || item.name);
        if (!rawTitle || rawTitle.startsWith("|||")) continue;

        const linkVal = typeof item.link === 'string' ? item.link.trim() : '';
        const thumbVal = decodePoster(item.thumbnail || item.poster);

        let finalId = linkVal;
        if (linkVal.startsWith('chresolver1=')) {
          const parts = linkVal.replace('chresolver1=', '').split('#');
          if (parts[0]) finalId = parts[0];
        }

        if (finalId) {
          const parsed = ParsedChannelSchema.safeParse({
            id: `br_${out.length + 1}`,
            name: rawTitle,
            thumb: thumbVal,
            category: this.classifyChannel(rawTitle),
            internalId: finalId
          });
          if (parsed.success) out.push(parsed.data);
        }
      }
    } catch (e) {
      console.error('[Channels] Error: ', e);
      throw e;
    }
    return out;
  }

  public async fetchVod(url: string, category: string, contentType: string, idPrefix = 'vod_', startIndex = 0): Promise<ParsedItem[]> {
    const itemsOut: ParsedItem[] = [];
    try {
      const resp = await fetch(url);
      if (!resp.ok) return [];
      const rawText = await resp.text();
      const jsonObj = this.parser.parse(rawText);
      const items = this.extractItems(jsonObj);
      
      for (const item of items) {
        const rawName = cleanTitle(item.name || item.title);
        if (!rawName) continue;

        const linkVal = typeof item.externallink === 'string' ? item.externallink.trim() : (typeof item.link === 'string' ? item.link.trim() : '');

        if (rawName.toUpperCase().includes('PRÓXIMA PÁGINA') || rawName.toUpperCase().includes('PRÃ“XIMA PÃ GINA')) {
          if (linkVal) {
             const nextItems = await this.fetchVod(linkVal, category, contentType, idPrefix, startIndex + itemsOut.length);
             itemsOut.push(...nextItems);
          }
          continue;
        }

        const thumbVal = decodePoster(item.thumbnail || item.poster || item.img);
        const fanartVal = decodePoster(item.fanart || item.backdrop || item.cover) || thumbVal;
        const infoVal = cleanTitle(item.info);

        let finalId = linkVal;
        if (linkVal.startsWith('#')) {
          const parts = linkVal.split('=');
          if (parts.length > 1 && parts[1]) {
            finalId = parts[1];
          }
        }

        if (finalId) {
          const parsed = ParsedItemSchema.safeParse({
            id: `${idPrefix}${startIndex + itemsOut.length + 1}`,
            name: rawName,
            thumb: thumbVal,
            fanart: fanartVal,
            category,
            contentType,
            info: infoVal,
            internalId: finalId
          });
          if (parsed.success) itemsOut.push(parsed.data);
        }
      }
    } catch (e) {
      console.error(`[VOD] Error downloading ${category}: `, e);
      throw e;
    }
    return itemsOut;
  }
}
