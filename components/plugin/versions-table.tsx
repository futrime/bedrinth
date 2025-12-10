"use client";
import type { GetPackageResponse } from "@/lib/api";

import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/react";
import { Pagination } from "@heroui/react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { IoToday } from "react-icons/io5";
import { Chip } from "@heroui/react";
import { Button } from "@heroui/react";
import { GrCube, GrInstall, GrDownload } from "react-icons/gr";
import { motion } from "framer-motion";
import { useDisclosure } from "@heroui/react";
import { Link } from "@heroui/react";

import InstallModal from "./install-modal";
export default function VersionCard({
  pkg,
}: Readonly<{
  pkg: GetPackageResponse;
}>) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(pkg.versions.length / itemsPerPage);

  const currentItems = pkg.versions.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const platform = pkg.tags
    .find((t) => t.startsWith("platform:"))
    ?.split(":")[1];

  return (
    <Table
      isStriped
      aria-label="VersionCard"
      bottomContent={
        pkg.versions.length > itemsPerPage && (
          <div className="flex w-full justify-end p-4">
            <Pagination
              isCompact
              showControls
              showShadow
              color="secondary"
              page={page}
              total={totalPages}
              onChange={(page) => setPage(page)}
            />
          </div>
        )
      }
      shadow="none"
    >
      <TableHeader className="bg-gray-100 dark:bg-gray-800 font-semibold">
        <TableColumn>Name</TableColumn>
        <TableColumn>Platform Requirement</TableColumn>
        <TableColumn>Stats</TableColumn>
        <TableColumn> </TableColumn>
      </TableHeader>
      <TableBody>
        {currentItems.map((version) => (
          <TableRow key={version.version}>
            <TableCell className="p-4">{version.version}</TableCell>
            <TableCell className="p-4">
              <Chip>
                {platform} {version.platformVersionRequirement}
              </Chip>
            </TableCell>
            <TableCell className="p-4">
              <div className="flex items-center space-x-2">
                <IoToday className="text-xl" />
                <span className="text-base">
                  {formatDistanceToNow(new Date(version.releasedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </TableCell>
            <TableCell className="p-4">
              <HoverButton pkg={pkg} versionStr={version.version} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

const HoverButton = ({
  pkg,
  versionStr,
}: {
  pkg: GetPackageResponse;
  versionStr: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const version = pkg?.versions.find((t) => t.version === versionStr);

  return (
    <>
      {version?.source === "github" && version?.packageManager === "" ? (
        <>
          <Link
            isExternal
            href={`https://${pkg.identifier}/releases/tag/${versionStr}`}
            size="sm"
          >
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button isIconOnly variant="light">
                {<GrDownload size={24} />}
              </Button>
            </motion.div>
          </Link>
        </>
      ) : (
        <>
          <Button
            isIconOnly
            variant="light"
            onClick={() => {
              onOpen();
              setIsHovered(false);
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.div
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {isHovered ? <GrInstall size={28} /> : <GrCube size={28} />}
            </motion.div>
          </Button>
          <InstallModal
            isOpen={isOpen}
            pkg={pkg}
            versionStr={versionStr}
            onOpen={onOpen}
            onOpenChange={onOpenChange}
          />
        </>
      )}
    </>
  );
};
