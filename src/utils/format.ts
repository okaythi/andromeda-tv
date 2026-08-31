export function formatRating(value: number | string | null): string | null {
  if (value === null) return null;
  const numberValue = typeof value === 'number' ? value : Number.parseFloat(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue.toFixed(1) : null;
}

export function formatRuntime(minutes: number | null): string | null {
  if (!minutes || minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours > 0 ? `${hours}h ${remainingMinutes.toString().padStart(2, '0')}min` : `${remainingMinutes}min`;
}

export function formatYear(value: number | null, date: string | null): string | null {
  if (value) return String(value);
  if (!date || !/^\d{4}/.test(date)) return null;
  return date.slice(0, 4);
}

export function formatGuideTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Horário indisponível';
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatGuideDate(value: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(value);
}
