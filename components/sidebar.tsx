import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  tags: string[];
  selectedTags: string[];
  currentParams: {
    q?: string;
    tags?: string;
    sort?: string;
    page?: string;
  };
}

function buildTagUrl(
  tag: string,
  selectedTags: string[],
  currentParams: SidebarProps["currentParams"],
): string {
  const isSelected = selectedTags.includes(tag);
  const newTags = isSelected
    ? selectedTags.filter((t) => t !== tag)
    : [...selectedTags, tag];

  const p = new URLSearchParams();
  if (currentParams.q) p.set("q", currentParams.q);
  if (newTags.length > 0) p.set("tags", newTags.join(","));
  if (currentParams.sort && currentParams.sort !== "relevance")
    p.set("sort", currentParams.sort);
  // Reset to page 1 when changing tags

  const qs = p.toString();
  return qs ? `/?${qs}` : "/";
}

export function Sidebar({ tags, selectedTags, currentParams }: SidebarProps) {
  return (
    <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Tags</h3>
        {/* Mobile View: 3 Staggered Rows (Scrollable) */}
        <div className="md:hidden space-y-2 overflow-x-auto pb-4 scrollbar-hide">
          {[0, 1, 2].map((rowIndex) => (
            <div key={rowIndex} className="flex gap-2 w-max">
              {tags
                .filter((_, i) => i % 3 === rowIndex)
                .map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <Link
                      key={tag}
                      href={buildTagUrl(tag, selectedTags, currentParams)}
                      prefetch={false}
                    >
                      <Badge
                        variant={isSelected ? "default" : "outline"}
                        className="cursor-pointer transition-all hover:scale-105 active:scale-95 whitespace-nowrap px-3 py-1"
                      >
                        {tag}
                      </Badge>
                    </Link>
                  );
                })}
            </div>
          ))}
        </div>

        {/* Desktop View: Standard Wrap */}
        <div className="hidden md:flex md:flex-wrap gap-2">
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <Link
                key={tag}
                href={buildTagUrl(tag, selectedTags, currentParams)}
                prefetch={false}
              >
                <Badge
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer transition-all hover:scale-105 active:scale-95 whitespace-nowrap px-3 py-1"
                >
                  {tag}
                </Badge>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
