import type { AppView } from './types';

export function documentTitleFor(view: AppView): string {
  switch (view.type) {
    case 'title':
      return `${view.title.title} | Andromeda TV`;
    case 'channel':
      return `${view.channel.name} | Andromeda TV`;
    case 'search':
      return view.query ? `Busca: ${view.query} | Andromeda TV` : 'Buscar | Andromeda TV';
    case 'channels':
      return 'Canais | Andromeda TV';
    case 'category':
      return `${view.title} | Andromeda TV`;
    case 'my-list':
      return 'Minha lista | Andromeda TV';
    case 'home':
      return 'Andromeda TV';
  }
}
