export interface PackageInfo {
  name: string;
  description: string;
  tags: string[];
  avatar_url?: string;
}

export interface RawPackageEntry {
  info: PackageInfo;
  updated_at: string;
  stars: number;
  versions: Record<string, string[]>;
}

export interface Package {
  tooth: string;
  info: PackageInfo;
  stars: number;
  updated: string;
  versions: string[];
}

export interface PackageIndex {
  format_version: number;
  format_uuid: string;
  packages: Record<string, RawPackageEntry>;
}

export function normalizePackageIndex(index: PackageIndex): Package[] {
  return Object.entries(index.packages).map(([tooth, pkg]) => ({
    tooth,
    info: pkg.info,
    stars: pkg.stars,
    updated: pkg.updated_at,
    versions: Object.keys(pkg.versions),
  }));
}
