export class ResolverService {
  constructor(private readonly _geekToken: string) {}

  public async resolveLink(internalId: string, resolverType: number = 2): Promise<string> {
    const raw = internalId.trim();

    // OnePlay Movie
    if (raw.startsWith('opmovie#')) {
      const parts = raw.split('#');
      if (parts.length >= 4) {
        try {
          const accJson = atob(parts[1] as string);
          const acc = JSON.parse(accJson);
          return `${acc.baseUrl}/movie/${acc.user}/${acc.pass}/${parts[2]}.${parts[3]}`;
        } catch (e) {
          return raw;
        }
      }
    }

    // OnePlay Series
    if (raw.startsWith('opseries#')) {
      const parts = raw.split('#');
      if (parts.length >= 4) {
        try {
          const accJson = atob(parts[1] as string);
          const acc = JSON.parse(accJson);
          return `${acc.baseUrl}/series/${acc.user}/${acc.pass}/${parts[2]}.${parts[3]}`;
        } catch (e) {
          return raw;
        }
      }
    }

    // Direct URL
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return raw;
    }

    // GeekAntenado API Resolver
    try {
      const paramsObj = { resolver: resolverType, request: raw };
      const paramsStr = JSON.stringify(paramsObj);
      const b64Payload = btoa(paramsStr);
      const apiUrl = `https://api.geekantenado.online/?resolver=${encodeURIComponent(b64Payload)}`;

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${this._geekToken}`,
          'User-Agent': 'Mozilla/5.0'
        }
      });

      if (response.ok) {
        const data = await response.json() as any;
        if (data && data.result) {
          const streamUrl = atob(data.result).trim();
          if (streamUrl.startsWith('http')) {
            return streamUrl;
          }
        }
      }
    } catch (e) {
      console.error('[Resolver] Error:', e);
    }

    return raw;
  }
}
