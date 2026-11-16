'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { avatarTone, initials } from '@/lib/design/tokens';

type Size = 'xs' | 'sm' | 'md' | 'lg';

const SIZE: Record<Size, string> = {
  xs: 'size-5 text-[9px]',
  sm: 'size-6 text-2xs',
  md: 'size-8 text-xs',
  lg: 'size-10 text-sm',
};

interface Person {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

interface UserAvatarProps {
  user: Person;
  size?: Size;
  className?: string;
  /** Adds a ring matching the surface — used when avatars overlap */
  ring?: boolean;
}

export function UserAvatar({ user, size = 'md', className, ring }: UserAvatarProps) {
  return (
    <Avatar className={cn(SIZE[size], ring && 'ring-2 ring-card', className)} title={user.name}>
      {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
      <AvatarFallback className={cn('font-semibold', avatarTone(user.id || user.name))}>
        {size === 'xs' || size === 'sm' ? initials(user.name).charAt(0) : initials(user.name)}
      </AvatarFallback>
    </Avatar>
  );
}

interface AvatarStackProps {
  users: Person[];
  max?: number;
  size?: Size;
  className?: string;
}

export function AvatarStack({ users, max = 3, size = 'sm', className }: AvatarStackProps) {
  if (!users.length) return null;
  const shown = users.slice(0, max);
  const rest = users.length - shown.length;
  const names = users.map((u) => u.name).join(', ');

  return (
    <div className={cn('flex items-center -space-x-1.5', className)} aria-label={names} role="img">
      {shown.map((u) => (
        <UserAvatar
          key={u.id}
          user={u}
          size={size}
          ring
          className="transition-transform duration-quick hover:z-10 hover:-translate-y-0.5"
        />
      ))}
      {rest > 0 && (
        <span
          className={cn(
            'relative inline-flex items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground ring-2 ring-card',
            SIZE[size]
          )}
          title={users.slice(max).map((u) => u.name).join(', ')}
        >
          +{rest}
        </span>
      )}
    </div>
  );
}
