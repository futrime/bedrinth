"use client";

import * as React from "react";
import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Package, PackageIndex } from "@/types";
import { PackageList } from "@/components/package-list";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MiniSearch from "minisearch";
import { Loader2 } from "lucide-react";

// FlexSearch doesn't have good TS support by default sometimes
// We'll use "any" for the index if needed, or proper types if available.
// Since we don't know if @types/flexsearch is present and working well, we'll be careful.

const ITEMS_PER_PAGE = 12;

export default function IndexPage() {
  return (
    <Suspense>
      <IndexPageContent />
    </Suspense>
  );
}

function IndexPageContent() {

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [sortBy, setSortBy] = useState<"updated" | "stars" | "relevance">(
    "relevance",
  );

  // Search Index
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [index, setIndex] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("https://lipr.levimc.org/index.json");
        const data: PackageIndex = await res.json();
        setPackages(data.packages);

        // Initialize MiniSearch
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newIndex: any = new MiniSearch({
          idField: "tooth",
          fields: ["name", "description", "tags"],
          storeFields: ["tooth", "info"],
        });

        // Add packages to index
        newIndex.addAll(
          data.packages.map((pkg) => ({
            tooth: pkg.tooth,
            name: pkg.info.name,
            description: pkg.info.description,
            tags: pkg.info.tags.join(" "),
          }))
        );

        setIndex(newIndex);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch packages:", error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filtering and Sorting
  const filteredPackages = useMemo(() => {
    let result = packages;

    // 1. Search
    const scores = new Map<string, number>();

    if (searchQuery && index) {
      const searchResults = index.search(searchQuery, {
        boost: { name: 3, tags: 2 },
        prefix: true,
        fuzzy: 0.2,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      searchResults.forEach((result: any) => {
        scores.set(result.id, result.score);
      });

      if (searchResults.length > 0) {
        result = result.filter((pkg) => scores.has(pkg.tooth));
      } else if (searchQuery.trim() !== "") {
        result = [];
      }
    }

    // 2. Tags
    if (selectedTags.length > 0) {
      result = result.filter((pkg) =>
        selectedTags.every((tag) => pkg.info.tags.includes(tag)),
      );
    }

    // 3. Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === "relevance") {
        if (!searchQuery) return 0; // Maintain original order
        return (scores.get(b.tooth) || 0) - (scores.get(a.tooth) || 0);
      }
      if (sortBy === "stars") {
        return b.stars - a.stars;
      }
      return new Date(b.updated).getTime() - new Date(a.updated).getTime();
    });

    return result;
  }, [packages, searchQuery, selectedTags, sortBy, index]);

  // Infinite Scroll
  const [itemsToShow, setItemsToShow] = useState(ITEMS_PER_PAGE);

  const paginatedPackages = useMemo(() => {
    return filteredPackages.slice(0, itemsToShow);
  }, [filteredPackages, itemsToShow]);

  // Observer for loading more
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setItemsToShow((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredPackages.length));
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [filteredPackages.length, itemsToShow]);

  const hasMore = itemsToShow < filteredPackages.length;

  // Extract all unique tags
  // Extract all unique tags sorted by frequency
  const allTags = useMemo(() => {
    const tagCounts = new Map<string, number>();
    packages.forEach((pkg) => {
      pkg.info.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagCounts.keys()).sort((a, b) => {
      // Sort by count descending, then alphabetically ASC
      const countDiff = (tagCounts.get(b) || 0) - (tagCounts.get(a) || 0);
      if (countDiff !== 0) return countDiff;
      return a.localeCompare(b);
    });
  }, [packages]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

    setItemsToShow(ITEMS_PER_PAGE);
  };

  // Reset current page when search query changes (happens during render)
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);
  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery);

    setItemsToShow(ITEMS_PER_PAGE);
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex gap-8">
          <div className="hidden md:block w-64 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="flex-1 space-y-6">
            <div className="flex justify-between">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <Sidebar
          tags={allTags}
          selectedTags={selectedTags}
          onToggleTag={toggleTag}
        />

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === "relevance" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("relevance")}
                >
                  Relevance
                </Button>
                <Button
                  variant={sortBy === "updated" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("updated")}
                >
                  Updated
                </Button>
                <Button
                  variant={sortBy === "stars" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("stars")}
                >
                  Stars
                </Button>
              </div>
            </div>
          </div>

          <div className="mb-4 text-sm text-gray-500">
            Showing {filteredPackages.length} packages
          </div>

          <PackageList packages={paginatedPackages} />

          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
          )}

          {!hasMore && filteredPackages.length > 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No more packages to load
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
