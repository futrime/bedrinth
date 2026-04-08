import Link from "next/link";
import { Star, Clock } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Package } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PackageCardProps {
  pkg: Package;
}

export function PackageCard({ pkg }: Readonly<PackageCardProps>) {
  return (
    <Card className="flex flex-col h-full transition-all hover:border-gray-400 dark:hover:border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <Avatar
              src={pkg.info.avatar_url}
              alt={pkg.info.name}
              name={pkg.info.name}
              className="w-10 h-10 rounded-md shrink-0"
            />
            <div className="min-w-0">
              <CardTitle className="text-xl truncate block" title={pkg.info.name}>
                <Link
                  href={`/packages/${pkg.tooth}`}
                  className="hover:underline"
                  prefetch={false}
                >
                  {pkg.info.name}
                </Link>
              </CardTitle>
              <CardDescription className="line-clamp-2 mt-1 break-words">
                {pkg.info.description}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-end">
        <div className="flex flex-wrap gap-1.5 max-h-[3.25rem] overflow-hidden content-start">
          {pkg.info.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-gray-500 dark:text-gray-400 border-t pt-4 mt-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span>{pkg.stars}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{new Date(pkg.updated).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="text-xs">{pkg.versions.at(-1)}</div>
      </CardFooter>
    </Card>
  );
}
