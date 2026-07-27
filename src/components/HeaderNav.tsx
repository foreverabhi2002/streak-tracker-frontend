"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession, User } from "@/lib/api";
import { usePathname } from "next/navigation";

export function HeaderNav() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setUser(getSession());
  }, [pathname]); // Re-check session on route change

  if (!user) return null;

  return (
    <Link href="/profile" className="text-sm font-medium hover:text-accent transition-colors">
      Profile
    </Link>
  );
}
