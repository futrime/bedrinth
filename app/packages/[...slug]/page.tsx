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

// Enable caching for index.json fetch (revalidate every hour)
const INDEX_URL = "https://lipr.levimc.org/index.json";

async function getPackages(): Promise<PackageIndex> {
  const res = await fetch(INDEX_URL, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch packages");
  return res.json();
}

// Fetch specific manifest
async function getManifest(tooth: string, version: string) {
  // Use http per user example, or https if supported.
  // User prompt said "http://lipr.levimc.org/...".
  // Best to stick to what works.
  const url = `http://lipr.levimc.org/${tooth}/${version}/tooth.json`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// Fetch README from raw.githubusercontent.com
async function getReadme(tooth: string, version: string) {
  // tooth is like "github.com/User/Repo"
  // We need "User/Repo"
  const parts = tooth.split("/");
  if (parts[0] !== "github.com" || parts.length < 3) return null;

  const repoPath = parts.slice(1).join("/");
  // Tag convention: v + version
  const tag = `v${version}`;
  const url = `https://raw.githubusercontent.com/${repoPath}/${tag}/README.md`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      // Fallback: try without 'v' prefix if standard fails?
      // User explicitly said "add a 'v' prefix". So we stick to that.
      // But maybe check main/master if version fails? No, specific version.
      return null;
    }
    return await res.text();
  } catch {
    return null;
  }
}

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function PackageDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  // slug can be ["github.com", "User", "Repo"] or ["github.com", "User", "Repo", "1.0.0"]
  const slugParts = resolvedParams.slug;
  const slugPath = slugParts.join("/");

  const packageIndex = await getPackages();

  // 1. Try exact match (slug is the tooth) -> Default to latest version
  let pkg = packageIndex.packages.find((p) => p.tooth === slugPath);
  let version: string | undefined;

  // 2. If not found, try stripping last part as version
  if (!pkg && slugParts.length > 1) {
    const possibleVersion = slugParts[slugParts.length - 1];
    const possibleTooth = slugParts.slice(0, slugParts.length - 1).join("/");

    const foundPkg = packageIndex.packages.find(
      (p) => p.tooth === possibleTooth,
    );
    if (foundPkg) {
      // Verify if version exists in package
      if (foundPkg.versions.includes(possibleVersion)) {
        pkg = foundPkg;
        version = possibleVersion;
      }
    }
  }

  if (!pkg) {
    notFound();
  }

  // If we matched the package but no version in URL, redirect to latest
  if (!version) {
    const latest = pkg.versions[pkg.versions.length - 1];
    redirect(`/packages/${pkg.tooth}/${latest}`);
  }

  // Fetch manifest and README for the specific version
  const manifest = await getManifest(pkg.tooth, version);
  const readme = await getReadme(pkg.tooth, version);

  // Fallback info
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
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Header Section */}
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
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkAlert]}
                  >
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

        {/* Sidebar Info */}
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
                  {new Date(pkg.updated).toLocaleDateString()}
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
                    href={`https://${pkg.tooth}`}
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
                {pkg.versions
                  .slice()
                  .reverse()
                  .map((v) => {
                    const isCurrent = v === version;
                    const versionUrl = `/packages/${pkg!.tooth}/${v}`;
                    return (
                      <Link key={v} href={versionUrl}>
                        <Badge
                          variant={isCurrent ? "default" : "outline"}
                          className={`font-mono cursor-pointer transition-colors ${!isCurrent ? "hover:bg-gray-100 dark:hover:bg-gray-800" : ""}`}
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
