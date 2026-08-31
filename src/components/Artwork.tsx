import { ImageOff } from 'lucide-react';
import { useState } from 'react';

interface ArtworkProps {
  src: string | null;
  alt: string;
  aspect: 'poster' | 'backdrop' | 'logo' | 'still';
  className?: string;
}

interface ArtworkImageProps extends ArtworkProps {
  src: string;
}

function MissingArtwork({ alt, aspect, className = '' }: ArtworkProps) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-black text-zinc-500 ${className}`}
    >
      <ImageOff aria-hidden="true" size={aspect === 'logo' ? 24 : 32} strokeWidth={1.5} />
    </div>
  );
}

function ArtworkImage({ src, alt, aspect, className = '' }: ArtworkImageProps) {
  const [hasFailed, setHasFailed] = useState(false);

  if (hasFailed) {
    return <MissingArtwork src={null} alt={alt} aspect={aspect} className={className} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasFailed(true)}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}

export function Artwork({ src, alt, aspect, className = '' }: ArtworkProps) {
  if (!src) return <MissingArtwork src={null} alt={alt} aspect={aspect} className={className} />;
  return <ArtworkImage key={src} src={src} alt={alt} aspect={aspect} className={className} />;
}
