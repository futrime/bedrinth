"use client";
import type { GetPackageResponse } from "@/lib/api";

import { motion } from "framer-motion";
import { Card } from "@heroui/card";
import { User } from "@heroui/user";
import { Link } from "@heroui/link";
import { Chip } from "@heroui/chip";
import { useMemo } from "react";

export default function SideBar({
  pkg,
}: Readonly<{
  pkg: GetPackageResponse;
}>) {
  const filteredTags = useMemo(
    () =>
      pkg?.tags.filter(
        (item) => !item.startsWith("type:") && !item.startsWith("platform:"),
      ),
    [pkg],
  );

  return (
    <>
      <motion.div
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        <Card className="shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {filteredTags?.map((item) => (
              <Chip
                key={item}
                className="text-gray-500 dark:text-gray-300"
                size="sm"
                variant="shadow"
              >
                <span className="font-bold">{item}</span>
              </Chip>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
      >
        <Card className="shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Contributors
          </h2>
          <div className="flex flex-wrap gap-4">
            {pkg.contributors.map((contributor) => (
              <Link
                key={contributor.username}
                isExternal
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                href={`https://github.com/${contributor.username}`}
                size="sm"
              >
                <User
                  avatarProps={{
                    src: `https://avatars.githubusercontent.com/${contributor.username}`,
                    className: "w-10 h-10 rounded-full",
                  }}
                  name={contributor.username}
                />
              </Link>
            ))}
          </div>
        </Card>
      </motion.div>
      {/*
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
      >
        <Card className="shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300">
          NULL
        </Card>
      </motion.div>
      */}
    </>
  );
}
