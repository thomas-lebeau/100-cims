'use client';

import { cn } from '@/lib/cn';
import { UserNav } from './user-nav';

export default function Nav({ className }: { className?: string }) {
  return (
    <nav className={cn(className, 'flex h-12 ml-auto items-center px-2 py-4')}>
      <UserNav className="flex ml-auto" />
    </nav>
  );
}
