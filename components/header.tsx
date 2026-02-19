import Link from "next/link";
import { Search } from "@/components/search";
import { Suspense } from "react";

export function Header() {
  return (
    <header className="border-b bg-white dark:bg-gray-950 dark:border-gray-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-bold text-xl tracking-tight hover:opacity-80 transition-opacity shrink-0"
        >
          bedrinth
        </Link>
        <div className="flex-1 max-w-md">
          <Suspense>
            <Search />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
