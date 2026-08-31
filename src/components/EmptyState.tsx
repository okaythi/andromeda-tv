import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </section>
  );
}
