"use client";
import type { GetPackageResponse } from "@/lib/api";

import { useDisclosure } from "@heroui/modal";
import { Button } from "@heroui/button";
import { motion } from "framer-motion";
import { GrInstall, GrDownload } from "react-icons/gr";
import { Link } from "@heroui/link";

import InstallModal from "./install-modal";

export default function InstallButton({
  pkg,
}: Readonly<{
  pkg: GetPackageResponse;
}>) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        {pkg.versions[0].packageManager === "" &&
          pkg.versions[0].source === "github" ? (
          <Link
            isExternal
            href={`https://${pkg.identifier}/releases/tag/${pkg.versions[0].version
              }`}
            size="sm"
          >
            <Button className="text-lg font-bold text-white bg-blue-500 dark:bg-blue-800 dark:text-gray-200 px-4 py-2 rounded-lg flex items-center">
              <GrDownload className="mr-2" size={20} />
              Download
            </Button>
          </Link>
        ) : (
          <Button
            className="text-lg font-bold text-white bg-blue-500 dark:bg-blue-800 dark:text-gray-200 px-4 py-2 rounded-lg flex items-center"
            onPress={onOpen}
          >
            <GrInstall className="mr-2" size={28} /> Install
          </Button>
        )}
      </motion.div>

      <InstallModal
        isOpen={isOpen}
        pkg={pkg}
        versionStr={pkg.versions[0].version}
        onOpen={onOpen}
        onOpenChange={onOpenChange}
      />
    </>
  );
}
