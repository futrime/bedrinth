import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  buildUrl: (page: number) => string;
}

export function Pagination({
  currentPage,
  totalPages,
  buildUrl,
}: PaginationProps) {
  // Show a window of pages around the current page
  const windowSize = 2;
  const pages: (number | "...")[] = [];

  // Always show first page
  pages.push(1);

  const rangeStart = Math.max(2, currentPage - windowSize);
  const rangeEnd = Math.min(totalPages - 1, currentPage + windowSize);

  if (rangeStart > 2) pages.push("...");

  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  if (rangeEnd < totalPages - 1) pages.push("...");

  // Always show last page if > 1
  if (totalPages > 1) pages.push(totalPages);

  return (
    <nav className="flex items-center justify-center gap-1 py-8" aria-label="Pagination">
      {currentPage > 1 ? (
        <Link
          href={buildUrl(currentPage - 1)}
          prefetch={false}
          className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-200 dark:border-gray-800 opacity-40 cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
        </span>
      )}

      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="inline-flex items-center justify-center w-9 h-9 text-sm text-gray-500"
          >
            ...
          </span>
        ) : (
          <Link
            key={p}
            href={buildUrl(p)}
            prefetch={false}
            className={`inline-flex items-center justify-center w-9 h-9 rounded-md text-sm font-medium transition-colors ${
              p === currentPage
                ? "bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900"
                : "border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            aria-label={`Page ${p}`}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </Link>
        ),
      )}

      {currentPage < totalPages ? (
        <Link
          href={buildUrl(currentPage + 1)}
          prefetch={false}
          className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-200 dark:border-gray-800 opacity-40 cursor-not-allowed">
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </nav>
  );
}
