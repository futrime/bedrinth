import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";
import { ArrowLeft, Star, Clock, Tag, Box, Github } from "lucide-react";
import { PackageIndex } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/avatar";

const INDEX_URL = "https://lipr.levimc.org/index.json";

async function getPackages(): Promise<PackageIndex> {
  const res = await fetch(INDEX_URL, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch packages");
  return res.json();
}

async function getManifest(tooth: string, version: string) {
  const httpsUrl = `https://lipr.levimc.org/${tooth}/@v/${version}/tooth.json`;
  const httpUrl = `http://lipr.levimc.org/${tooth}/@v/${version}/tooth.json`;
  try {
    const httpsRes = await fetch(httpsUrl, { next: { revalidate: 3600 } });
    if (httpsRes.ok) return httpsRes.json();

    const httpRes = await fetch(httpUrl, { next: { revalidate: 3600 } });
    if (!httpRes.ok) return null;
    return httpRes.json();
  } catch {
    return null;
  }
}

async function getReadme(tooth: string, version: string) {
  const parts = tooth.split("/");
  if (parts[0] !== "github.com" || parts.length < 3) return null;

  const repoPath = parts.slice(1).join("/");
  const tag = `v${version}`;
  const url = `https://raw.githubusercontent.com/${repoPath}/${tag}/README.md`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      return null;
    }
    return await res.text();
  } catch {
    return null;
  }
}

function buildPackageUrl(tooth: string, version?: string) {
  return version ? `/${tooth}@${version}` : `/${tooth}`;
}

function resolvePackageByTooth(packageEntries: PackageIndex["packages"], tooth: string) {
  const exact = packageEntries[tooth];
  if (exact) {
    return { tooth, pkg: exact };
  }

  const normalizedTooth = tooth.toLowerCase();
  const matchedTooth = Object.keys(packageEntries).find(
    (key) => key.toLowerCase() === normalizedTooth,
  );

  if (!matchedTooth) {
    return null;
  }

  return { tooth: matchedTooth, pkg: packageEntries[matchedTooth] };
}

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function PackageDetailPage({ params }: Readonly<PageProps>) {
  const resolvedParams = await params;
  const slugParts = resolvedParams.slug.map((segment) => {
    try {
      return decodeURIComponent(segment);
    } catch {
      return segment;
    }
  });
  const slugPath = slugParts.join("/");

  const packageIndex = await getPackages();
  const packageEntries = packageIndex.packages;

  let tooth = slugPath;
  let pkg = resolvePackageByTooth(packageEntries, tooth)?.pkg;
  let version: string | undefined;
  let versions = pkg ? Object.keys(pkg.versions) : [];

  if (!pkg) {
    const atIndex = slugPath.lastIndexOf("@");

    if (atIndex > 0) {
      const possibleTooth = slugPath.slice(0, atIndex);
      const possibleVersion = slugPath.slice(atIndex + 1);
      const resolved = resolvePackageByTooth(packageEntries, possibleTooth);

      if (resolved && possibleVersion) {
        const foundVersions = Object.keys(resolved.pkg.versions);
        if (foundVersions.includes(possibleVersion)) {
          tooth = resolved.tooth;
          pkg = resolved.pkg;
          version = possibleVersion;
          versions = foundVersions;
        }
      }
    }
  }

  if (!pkg && slugParts.length > 1) {
    const possibleVersion = slugParts.at(-1);
    const possibleTooth = slugParts.slice(0, -1).join("/");

    const resolved = resolvePackageByTooth(packageEntries, possibleTooth);
    if (resolved && possibleVersion) {
      const foundVersions = Object.keys(resolved.pkg.versions);
      if (foundVersions.includes(possibleVersion)) {
        tooth = resolved.tooth;
        pkg = resolved.pkg;
        version = possibleVersion;
        versions = foundVersions;
      }
    }
  }

  if (!pkg) {
    notFound();
  }

  if (!version) {
    const latest = versions.at(-1);
    if (!latest) {
      notFound();
    }
    redirect(buildPackageUrl(tooth, latest));
  }

  const manifest = await getManifest(tooth, version);
  const readme = await getReadme(tooth, version);

  const info = manifest?.info || pkg.info;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to packages
      </Link>

      <div className="grid gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-8">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <Avatar
                src={info.avatar_url}
                alt={info.name}
                name={info.name}
                className="w-24 h-24 rounded-xl"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold tracking-tight mb-2 break-words">
                {info.name}
              </h1>
              <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-3xl">
                {info.description}
              </p>
            </div>
          </div>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>README</CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              {readme ? (
                <div className="prose dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-table:border-collapse prose-th:border prose-td:border prose-th:p-2 prose-td:p-2 prose-img:inline-block prose-img:my-1 prose-img:mr-1 prose-p:my-4">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkAlert]}>
                    {readme}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No README available for version {version}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <Box className="w-4 h-4" /> Version
                </span>
                <span className="font-medium font-mono">{version}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <Star className="w-4 h-4" /> Stars
                </span>
                <span className="font-medium">{pkg.stars}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Updated
                </span>
                <span className="font-medium text-sm">
                  {new Date(pkg.updated_at).toLocaleDateString()}
                </span>
              </div>

              <div className="pt-2">
                <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Tags
                </div>
                <div className="flex flex-wrap gap-2">
                  {pkg.info.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                  {pkg.info.tags.length === 0 && (
                    <span className="text-sm text-gray-400">No tags</span>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <Button className="w-full" asChild>
                  <a
                    href={`https://${tooth}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <Github className="h-4 w-4" />
                    <span>View on GitHub</span>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Versions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto pr-2">
                {versions
                  .slice()
                  .reverse()
                  .map((v) => {
                    const isCurrent = v === version;
                    const versionUrl = buildPackageUrl(tooth, v);
                    return (
                      <Link key={v} href={versionUrl}>
                        <Badge
                          variant={isCurrent ? "default" : "outline"}
                          className={`font-mono cursor-pointer transition-colors ${isCurrent ? "" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                        >
                          {v}
                        </Badge>
                      </Link>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
