interface LoadingGridProps {
  count?: number;
  aspect?: 'poster' | 'landscape';
}

export function LoadingGrid({ count = 8, aspect = 'poster' }: LoadingGridProps) {
  const className = aspect === 'poster' ? 'aspect-[2/3]' : 'aspect-video';

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className={`${className} animate-pulse rounded-2xl bg-white/[0.07]`}
        />
      ))}
    </div>
  );
}
