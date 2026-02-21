import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function LegacyPackageRedirectPage({ params }: Readonly<PageProps>) {
  const resolvedParams = await params;
  const slugParts = resolvedParams.slug;

  if (!slugParts.length) {
    notFound();
  }

  if (slugParts.length === 1) {
    redirect(`/${slugParts[0]}`);
  }

  const version = slugParts.at(-1);
  const tooth = slugParts.slice(0, -1).join("/");

  if (!version || !tooth) {
    notFound();
  }

  redirect(`/${tooth}@${version}`);
}
