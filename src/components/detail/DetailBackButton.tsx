import { ArrowLeft } from 'lucide-react';

interface DetailBackButtonProps {
  onBack: () => void;
}

export function DetailBackButton({ onBack }: DetailBackButtonProps) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="relative z-10 inline-flex items-center gap-2 text-sm font-medium text-zinc-300 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
    >
      <ArrowLeft size={19} aria-hidden="true" />
      Voltar
    </button>
  );
}
