import FlexSearch from "flexsearch";
import {
  Package,
  PackageIndex,
} from "@/types";

const PACKAGE_INDEX_URL = "https://lipr.levimc.org/index.json";
const PACKAGE_REGISTRY_URL = "https://lipr.levimc.org";

export const ITEMS_PER_PAGE = 60;
export const REVALIDATE_SECONDS = 3600;
const SEARCH_LIMIT = 1000;
const SEARCH_NAME_WEIGHT = 3;
const SEARCH_TAG_WEIGHT = 2;
const MAX_RANK_BASE = 1000;

export function normalizePackageIndex(index: PackageIndex): Package[] {
  return Object.entries(index.packages).map(([tooth, pkg]) => ({
    tooth,
    info: {
      ...pkg.info,
      tags: Array.isArray(pkg.info.tags) ? pkg.info.tags : [],
    },
    stars: pkg.stargazer_count,
    updated: pkg.updated_at,
    versions: Array.from(
      new Set(
        Object.values(pkg.variants).flatMap((variant) => variant.versions),
      ),
    ),
  }));
}

export type SortOption = "relevance" | "updated" | "stars";

// ---------------------------------------------------------------------------
// Data Fetching
// ---------------------------------------------------------------------------

export async function fetchPackageIndex(): Promise<PackageIndex> {
  const res = await fetch(PACKAGE_INDEX_URL, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) throw new Error("Failed to fetch package index");
  return res.json();
}

export async function fetchPackages(): Promise<Package[]> {
  const index = await fetchPackageIndex();
  return normalizePackageIndex(index);
}

// ---------------------------------------------------------------------------
// Search  (FlexSearch, built per-request)
// ---------------------------------------------------------------------------

export function searchPackages(
  packages: Package[],
  query: string,
): { results: Package[]; scores: Map<string, number> } {
  if (!query.trim()) {
    return { results: packages, scores: new Map() };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const idx: any = new FlexSearch.Document({
    document: {
      id: "tooth",
      index: [
        { field: "info:name", tokenize: "full" },
        { field: "info:description", tokenize: "full" },
        { field: "info:tags", tokenize: "strict" },
      ],
      store: true,
    },
  });

  for (const pkg of packages) {
    idx.add({ tooth: pkg.tooth, info: pkg.info });
  }

  const searchResults = idx.search(query, { limit: SEARCH_LIMIT });
  const scores = new Map<string, number>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const fieldResult of searchResults as any[]) {
    let weight = 1;
    if (fieldResult.field === "info:name") weight = SEARCH_NAME_WEIGHT;
    else if (fieldResult.field === "info:tags") weight = SEARCH_TAG_WEIGHT;

    fieldResult.result.forEach((id: string, idx: number) => {
      const rankScore = (MAX_RANK_BASE - idx) * weight;
      scores.set(id, (scores.get(id) || 0) + rankScore);
    });
  }

  if (searchResults.length === 0) {
    return { results: [], scores };
  }

  const results = packages.filter((pkg) => scores.has(pkg.tooth));
  return { results, scores };
}

// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------

export function filterByTags(packages: Package[], tags: string[]): Package[] {
  if (tags.length === 0) return packages;
  return packages.filter((pkg) =>
    tags.every((tag) => (pkg.info.tags ?? []).includes(tag)),
  );
}

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

export function sortPackages(
  packages: Package[],
  sortBy: SortOption,
  scores: Map<string, number>,
  hasQuery: boolean,
): Package[] {
  return [...packages].sort((a, b) => {
    if (sortBy === "relevance") {
      if (!hasQuery) return 0;
      return (scores.get(b.tooth) || 0) - (scores.get(a.tooth) || 0);
    }
    if (sortBy === "stars") {
      return b.stars - a.stars;
    }
    // "updated"
    return new Date(b.updated).getTime() - new Date(a.updated).getTime();
  });
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export function paginatePackages(
  packages: Package[],
  page: number,
  perPage: number = ITEMS_PER_PAGE,
): { items: Package[]; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(packages.length / perPage));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const start = (safePage - 1) * perPage;
  return {
    items: packages.slice(start, start + perPage),
    totalPages,
  };
}

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

export function extractTags(packages: Package[]): string[] {
  const tagCounts = new Map<string, number>();
  for (const pkg of packages) {
    const tags = pkg.info.tags ?? [];
    for (const tag of tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }

  return Array.from(tagCounts.keys()).sort((a, b) => {
    const countDiff = (tagCounts.get(b) || 0) - (tagCounts.get(a) || 0);
    if (countDiff !== 0) return countDiff;
    return a.localeCompare(b);
  });
}

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

export function getPackageManifestUrl(tooth: string, version: string): string {
  return `${PACKAGE_REGISTRY_URL}/${tooth}@${version}/tooth.json`;
}

export function getReadmeUrl(tooth: string, version: string): string | null {
  const tag = `v${version}`;
  if (tooth.startsWith("github.com/")) {
    return `https://raw.githubusercontent.com/${tooth.slice("github.com/".length)}/${tag}/README.md`;
  }
  return `https://${tooth}/raw/refs/tags/${tag}/README.md`;
}
