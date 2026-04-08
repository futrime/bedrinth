"use client";

import * as React from "react";
import { Search as SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AUTO_SEARCH_ENABLED = process.env.NEXT_PUBLIC_AUTO_SEARCH === "1";
const AUTO_SEARCH_DEBOUNCE_MS = 900;

export function Search() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = React.useState(searchParams.get("q") || "");

  // Sync local state with URL param (in case of navigation)
  React.useEffect(() => {
    setValue(searchParams.get("q") || "");
  }, [searchParams]);

  const buildNextUrl = React.useCallback((nextQ: string): string | null => {
    const currentQ = searchParams.get("q") || "";
    if (nextQ === currentQ) return null;

    const params = new URLSearchParams(searchParams.toString());
    if (nextQ) {
      params.set("q", nextQ);
    } else {
      params.delete("q");
    }
    // Reset page to 1 on search, but preserve tags and sort.
    params.delete("page");

    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }, [searchParams]);

  React.useEffect(() => {
    if (!AUTO_SEARCH_ENABLED) return;

    const nextQ = value.trim();
    const timer = setTimeout(() => {
      const nextUrl = buildNextUrl(nextQ);
      if (!nextUrl) return;
      router.replace(nextUrl);
    }, AUTO_SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [value, router, buildNextUrl]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nextUrl = buildNextUrl(value.trim());
    if (!nextUrl) return;
    router.push(nextUrl);
  }

  return (
    <form className="flex w-full max-w-sm items-center gap-2" onSubmit={handleSubmit}>
      <div className="relative flex-1">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Search packages..."
          aria-label="Search packages"
          className="pl-9"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <Button type="submit" variant="outline" size="sm">
        Search
      </Button>
    </form>
  );
}
