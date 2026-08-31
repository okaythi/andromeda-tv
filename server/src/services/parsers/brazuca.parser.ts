import { XMLParser } from 'fast-xml-parser';
import { z } from 'zod';

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

type XmlRecord = Record<string, unknown>;

function isXmlRecord(value: unknown): value is XmlRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function textValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function cleanTitle(raw: string | undefined | null): string {
  if (!raw) return '';
  let title = raw;
  title = title.replace(/\[\/?COLOR[^\]]*\]/gi, '');
  title = title.replace(/\[\/?B\]/gi, '');
  title = title.replace(/\[\/?I\]/gi, '');
  title = title.replace(/\[OnePlay\]/gi, '');
  title = title.replace(/\[Brazuca\]/gi, '');
  return title.replace(/\|\|\|/g, '').replace(/\[CR\]/g, '\n').trim();
}

export function decodePoster(url: string | undefined | null): string {
  if (!url) return '';
  const clean = url.trim();
  if (!clean || clean === '[object Object]') return '';
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;

  try {
    const decoded = atob(clean);
    return decoded.startsWith('http') ? decoded : clean;
  } catch {
    return clean;
  }
}

function ensureArray(value: unknown): unknown[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export class BrazucaParser {
  private readonly parser = new XMLParser({
    ignoreAttributes: true,
    parseTagValue: false,
  });

  private classifyChannel(title: string): string {
    const normalizedTitle = title.toLocaleLowerCase('pt-BR');
    if (['sportv', 'espn', 'futebol', 'ufc', 'tnt sports', 'premiere', 'combate', 'dazn', 'bandsports', 'nba'].some((keyword) => normalizedTitle.includes(keyword))) return 'esportes';
    if (['globo', 'sbt', 'record', 'band', 'redetv', 'cultura'].some((keyword) => normalizedTitle.includes(keyword))) return 'abertos';
    if (['filme', 'cine', 'hbo', 'telecine', 'axn', 'fox', 'megapix', 'paramount', 'warner', 'universal', 'sony'].some((keyword) => normalizedTitle.includes(keyword))) return 'filmes';
    if (['news', 'notícia', 'noticia', 'cnn', 'bandnews', 'record news', 'globonews', 'jovem pan'].some((keyword) => normalizedTitle.includes(keyword))) return 'noticias';
    if (['kids', 'cartoon', 'disney', 'nickelodeon', 'discovery kids', 'gloob', 'tooncast', 'nick jr'].some((keyword) => normalizedTitle.includes(keyword))) return 'infantil';
    if (['discovery', 'history', 'animal planet', 'nat geo', 'national geographic', 'curta', 'h2', 'doc'].some((keyword) => normalizedTitle.includes(keyword))) return 'docs';
    if (['multishow', 'viva', 'mtv', 'gnt', 'bis', 'comedy central', 'tlc', 'e!'].some((keyword) => normalizedTitle.includes(keyword))) return 'variedades';
    return 'outros';
  }

  private extractItems(jsonObject: unknown): XmlRecord[] {
    const foundItems: XmlRecord[] = [];

    const search = (value: unknown): void => {
      if (!isXmlRecord(value)) return;

      for (const item of ensureArray(value['item'])) {
        if (isXmlRecord(item)) foundItems.push(item);
      }

      for (const channel of ensureArray(value['channel'])) {
        if (!isXmlRecord(channel)) continue;
        const channelItems = ensureArray(channel['item']);
        if (channelItems.length > 0) {
          for (const item of channelItems) {
            if (isXmlRecord(item)) foundItems.push(item);
          }
        } else {
          foundItems.push(channel);
        }
      }

      for (const [key, child] of Object.entries(value)) {
        if (key !== 'item' && key !== 'channel') search(child);
      }
    };

    search(jsonObject);
    return foundItems;
  }

  public async fetchChannels(url: string): Promise<ParsedChannel[]> {
    const channels: ParsedChannel[] = [];
    try {
      const response = await fetch(url);
      if (!response.ok) return [];
      const rawText = await response.text();
      const parsedXml: unknown = this.parser.parse(rawText);

      for (const item of this.extractItems(parsedXml)) {
        const rawTitle = cleanTitle(textValue(item['title']) || textValue(item['name']));
        if (!rawTitle || rawTitle.startsWith('|||')) continue;

        const linkValue = textValue(item['link']).trim();
        const thumbnail = decodePoster(textValue(item['thumbnail']) || textValue(item['poster']));
        const finalId = linkValue.startsWith('chresolver1=')
          ? linkValue.replace('chresolver1=', '').split('#')[0] ?? ''
          : linkValue;

        if (!finalId) continue;
        const candidate = ParsedChannelSchema.safeParse({
          id: `br_${channels.length + 1}`,
          name: rawTitle,
          thumb: thumbnail,
          category: this.classifyChannel(rawTitle),
          internalId: finalId,
        });
        if (candidate.success) channels.push(candidate.data);
      }
    } catch (error) {
      console.error('[Channels] Error:', error);
      throw error;
    }
    return channels;
  }

  public async fetchVod(
    url: string,
    category: string,
    contentType: string,
    idPrefix = 'vod_',
    startIndex = 0,
  ): Promise<ParsedItem[]> {
    const itemsOut: ParsedItem[] = [];
    try {
      const response = await fetch(url);
      if (!response.ok) return [];
      const rawText = await response.text();
      const parsedXml: unknown = this.parser.parse(rawText);

      for (const item of this.extractItems(parsedXml)) {
        const rawName = cleanTitle(textValue(item['name']) || textValue(item['title']));
        if (!rawName) continue;

        const linkValue = (textValue(item['externallink']) || textValue(item['link'])).trim();
        const isPagination = linkValue.startsWith('http') && (
          rawName.toUpperCase().includes('PRÓXIMA PÁGINA')
          || rawName.toUpperCase().includes('PRÃ“XIMA PÃ GINA')
          || rawName.toUpperCase().includes('PROXIMA PAGINA')
          || /pr[óoã\w]*xima\s+p[áaã\w]*g/i.test(rawName)
        );

        if (isPagination) {
          const nextItems = await this.fetchVod(linkValue, category, contentType, idPrefix, startIndex + itemsOut.length);
          itemsOut.push(...nextItems);
          continue;
        }

        if (!linkValue || linkValue.toLocaleLowerCase('pt-BR') === 'here') continue;

        const thumbnail = decodePoster(
          textValue(item['thumbnail']) || textValue(item['poster']) || textValue(item['img']),
        );
        const fanart = decodePoster(
          textValue(item['fanart']) || textValue(item['backdrop']) || textValue(item['cover']),
        ) || thumbnail;
        const info = cleanTitle(textValue(item['info']));
        const finalId = linkValue.startsWith('#')
          ? linkValue.split('=')[1] ?? ''
          : linkValue;

        if (!finalId) continue;
        const candidate = ParsedItemSchema.safeParse({
          id: `${idPrefix}${startIndex + itemsOut.length + 1}`,
          name: rawName,
          thumb: thumbnail,
          fanart,
          category,
          contentType,
          info,
          internalId: finalId,
        });
        if (candidate.success) itemsOut.push(candidate.data);
      }
    } catch (error) {
      console.error(`[VOD] Error downloading ${category}:`, error);
      throw error;
    }
    return itemsOut;
  }
}
