import Link from "next/link";
import {
  fetchPackages,
  searchPackages,
  filterByTags,
  sortPackages,
  paginatePackages,
  extractTags,
  ITEMS_PER_PAGE,
} from "@/lib/packages";
import type { SortOption } from "@/lib/packages";
import { PackageList } from "@/components/package-list";
import { Sidebar } from "@/components/sidebar";
import { Pagination } from "@/components/pagination";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    tags?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function IndexPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const query = params.q || "";
  const selectedTags = params.tags
    ? params.tags.split(",").filter(Boolean)
    : [];
  const sortBy: SortOption = (["relevance", "updated", "stars"] as const).includes(
    params.sort as SortOption,
  )
    ? (params.sort as SortOption)
    : "relevance";
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  // Fetch all packages server-side (ISR cached)
  const allPackages = await fetchPackages();

  // Extract tags from full dataset (before filtering)
  const allTags = extractTags(allPackages);

  // Search
  const { results: searched, scores } = searchPackages(allPackages, query);

  // Filter by tags
  const filtered = filterByTags(searched, selectedTags);

  // Sort
  const sorted = sortPackages(filtered, sortBy, scores, !!query);

  // Paginate
  const { items: paginatedPackages, totalPages } = paginatePackages(
    sorted,
    page,
    ITEMS_PER_PAGE,
  );

  // Build base params for links (without page)
  function buildUrl(overrides: Record<string, string | undefined>): string {
    const p = new URLSearchParams();
    const merged = { q: query, tags: params.tags, sort: sortBy, ...overrides };
    if (merged.q) p.set("q", merged.q);
    if (merged.tags) p.set("tags", merged.tags);
    if (merged.sort && merged.sort !== "relevance") p.set("sort", merged.sort);
    const pageVal = overrides.page;
    if (pageVal && pageVal !== "1") p.set("page", pageVal);
    const qs = p.toString();
    return qs ? `/?${qs}` : "/";
  }

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "relevance", label: "Relevance" },
    { value: "updated", label: "Updated" },
    { value: "stars", label: "Stars" },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <Sidebar
          tags={allTags}
          selectedTags={selectedTags}
          currentParams={params}
        />

        {/* Main Content */}
        <main className="flex-1">
          <h1 className="sr-only">Packages</h1>
          <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <div className="flex gap-2">
                {sortOptions.map((opt) => (
                  <Link
                    key={opt.value}
                    href={buildUrl({ sort: opt.value, page: "1" })}
                    prefetch={false}
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-9 px-3 ${
                      sortBy === opt.value
                        ? "bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900"
                        : "border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-4 text-sm text-gray-500">
            Showing {sorted.length} packages
          </div>

          <PackageList packages={paginatedPackages} />

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              buildUrl={(p) => buildUrl({ page: String(p) })}
            />
          )}

          {sorted.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No packages found
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
