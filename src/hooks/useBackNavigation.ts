import { useEffect } from 'react';

function isEditableTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement
    || target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement
    || (target instanceof HTMLElement && target.isContentEditable);
}

export function useBackNavigation(onBack: () => void, enabled: boolean): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isBackShortcut = event.key === 'Escape' || (event.altKey && event.key === 'ArrowLeft');
      if (!enabled || !isBackShortcut || isEditableTarget(event.target)) return;

      event.preventDefault();
      onBack();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onBack]);
}
