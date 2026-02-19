import { Package } from "@/types";
import { PackageCard } from "@/components/package-card";

interface PackageListProps {
  packages: Package[];
}

export function PackageList({ packages }: PackageListProps) {
  if (packages.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No packages found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {packages.map((pkg) => (
        <PackageCard key={pkg.tooth} pkg={pkg} />
      ))}
    </div>
  );
}
