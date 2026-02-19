import { Badge } from "@/components/ui/badge";

// I'll assume standard div for simplicity unless I make a ScrollArea component
interface SidebarProps {
  tags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
}

export function Sidebar({ tags, selectedTags, onToggleTag }: SidebarProps) {
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
                    <Badge
                      key={tag}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer transition-all hover:scale-105 active:scale-95 whitespace-nowrap px-3 py-1"
                      onClick={() => onToggleTag(tag)}
                    >
                      {tag}
                    </Badge>
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
              <Badge
                key={tag}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105 active:scale-95 whitespace-nowrap px-3 py-1"
                onClick={() => onToggleTag(tag)}
              >
                {tag}
              </Badge>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
