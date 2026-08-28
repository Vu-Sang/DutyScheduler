import React, { useState } from 'react';

interface AvatarImageProps {
  src?: string;
  name: string;
  className?: string;
}

export const AvatarImage: React.FC<AvatarImageProps> = ({ src, name, className = "w-full h-full object-cover" }) => {
  const [error, setError] = useState(false);

  const initial = name ? name.trim().slice(0, 1).toUpperCase() : '?';

  if (!src || error) {
    return (
      <div className="w-full h-full bg-[#003d9b] text-white font-black flex items-center justify-center text-[13px] select-none uppercase">
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setError(true)}
      className={className}
      referrerPolicy="no-referrer"
    />
  );
};
