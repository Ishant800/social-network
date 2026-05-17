import { VenetianMask } from 'lucide-react';

export default function AnonymousAvatar({ persona, size = 'md' }) {
  const color = persona?.avatarColor || '#7c3aed';
  const name = persona?.name || 'Anonymous';

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };
  const iconSizes = { sm: 14, md: 18, lg: 22 };

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center shrink-0 ring-2 ring-white shadow-sm`}
      style={{ backgroundColor: `${color}22`, border: `2px solid ${color}44` }}
      title={name}
    >
      <VenetianMask size={iconSizes[size]} style={{ color }} strokeWidth={2} />
    </div>
  );
}
