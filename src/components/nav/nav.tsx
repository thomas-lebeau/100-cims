"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import { UserMenu } from "./user-menu";

export default function Nav({ className }: { className?: string }) {
  return (
    <nav className={cn(className, "flex h-12 items-center px-2 py-4")}>
      <Link href="/" className="text-2xl font-bold mr-auto">
        💯🏔️ 100 cims
      </Link>
      <UserMenu className="flex ml-auto" />
    </nav>
  );
}
