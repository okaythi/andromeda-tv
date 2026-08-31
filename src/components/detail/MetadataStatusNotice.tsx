import type { MetadataStatus } from '../../../shared/catalog';

interface MetadataStatusNoticeProps {
  status: MetadataStatus;
}

const messages: Record<Exclude<MetadataStatus, 'ready'>, string> = {
  unmatched: 'Os dados editoriais deste título ainda não foram encontrados. As informações do catálogo continuam disponíveis.',
  unavailable: 'Os dados editoriais estão indisponíveis no momento. As informações do catálogo continuam disponíveis.',
};

export function MetadataStatusNotice({ status }: MetadataStatusNoticeProps) {
  if (status === 'ready') return null;

  return (
    <p className="rounded-xl border border-amber-200/15 bg-amber-300/10 px-4 py-3 text-sm leading-6 text-amber-100">
      {messages[status]}
    </p>
  );
}
