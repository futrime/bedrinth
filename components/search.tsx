"use client";

import * as React from "react";
import { Search as SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

export function Search() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = React.useState(searchParams.get("q") || "");

  // Sync local state with URL param (in case of navigation)
  React.useEffect(() => {
    setValue(searchParams.get("q") || "");
  }, [searchParams]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const currentQ = searchParams.get("q") || "";
      if (value === currentQ) return;

      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      // Reset page to 1 on search
      params.delete("page");

      router.push(`/?${params.toString()}`);
    }, 300);
    return () => clearTimeout(timer);
  }, [value, router, searchParams]);

  return (
    <div className="relative w-full max-w-sm">
      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground text-gray-500" />
      <Input
        type="search"
        placeholder="Search packages..."
        className="pl-9"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
