'use client';

import { UserNav } from './user-nav';

export default function Nav() {
  return (
    <div className="flex h-10 ml-auto items-center px-4">
      <div className="flex ml-auto">
        <UserNav />
      </div>
    </div>
  );
}
