interface OnePlayAccount {
  baseUrl: string;
  user: string;
  pass: string;
}

function parseRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function parseOnePlayAccount(value: unknown): OnePlayAccount | null {
  const record = parseRecord(value);
  if (!record) return null;

  const baseUrl = record['baseUrl'];
  const user = record['user'];
  const pass = record['pass'];
  return typeof baseUrl === 'string' && typeof user === 'string' && typeof pass === 'string'
    ? { baseUrl, user, pass }
    : null;
}

function parseResolverResult(value: unknown): string | null {
  const record = parseRecord(value);
  const result = record?.['result'];
  return typeof result === 'string' && result.trim().length > 0 ? result : null;
}

export class ResolverService {
  public constructor(private readonly geekToken: string) {}

  public async resolveLink(internalId: string, resolverType = 2): Promise<string> {
    const raw = internalId.trim();

    const onePlayUrl = this.resolveOnePlayUrl(raw);
    if (onePlayUrl) return onePlayUrl;

    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;

    try {
      const payload = btoa(JSON.stringify({ resolver: resolverType, request: raw }));
      const response = await fetch(`https://api.geekantenado.online/?resolver=${encodeURIComponent(payload)}`, {
        headers: {
          Authorization: `Bearer ${this.geekToken}`,
          'User-Agent': 'Mozilla/5.0',
        },
      });
      if (!response.ok) return raw;

      const encodedResult = parseResolverResult(await response.json() as unknown);
      if (!encodedResult) return raw;
      const streamUrl = atob(encodedResult).trim();
      return streamUrl.startsWith('http') ? streamUrl : raw;
    } catch (error: unknown) {
      console.error('[Resolver] Error:', error);
      return raw;
    }
  }

  private resolveOnePlayUrl(raw: string): string | null {
    const parts = raw.split('#');
    if (parts.length < 4 || (parts[0] !== 'opmovie' && parts[0] !== 'opseries')) return null;

    try {
      const account = parseOnePlayAccount(JSON.parse(atob(parts[1] ?? '')) as unknown);
      const streamId = parts[2];
      const extension = parts[3];
      if (!account || !streamId || !extension) return null;

      const path = parts[0] === 'opmovie' ? 'movie' : 'series';
      return `${account.baseUrl}/${path}/${account.user}/${account.pass}/${streamId}.${extension}`;
    } catch {
      return null;
    }
  }
}
