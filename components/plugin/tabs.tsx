"use client";
import type { GetPackageResponse } from "@/lib/api";

import { Tabs, Tab } from "@heroui/react";
import { FaLink } from "react-icons/fa";
import { motion } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import { Card } from "@heroui/react";

import VersionCard from "@/components/plugin/versions-table";
import Readme from "@/components/plugin/readme";

export default function PluginTabs({
  pkg,
  identifier,
  readme,
}: Readonly<{
  pkg: GetPackageResponse;
  identifier: string[];
  readme: string;
}>) {
  const [tab, setTab] = useState<string>(
    identifier[3] === "versions" ? "versions" : "description",
  );

  const handleTabChange = useCallback(
    (key: string) => {
      setTab(key);
      const basePath = identifier.slice(0, 3).join("/");
      const newUrl =
        key === "description" ? `${basePath}` : `${basePath}/${key}`;

      window.history.pushState(null, "", "/packages/" + newUrl);
    },
    [identifier],
  );

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const segments = path.split("/");
      const key = segments[segments.length - 1];

      let newTab = "description";

      if (key === "versions") {
        newTab = "versions";
      } else if (key === "project") {
        newTab = "project";
      }

      setTab(newTab);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <Tabs
      aria-label="Tabs variants"
      selectedKey={tab}
      variant="underlined"
      onSelectionChange={(key) => handleTabChange(key as string)}
    >
      <Tab key="description" title="Description">
        <motion.div
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <Card className="shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="tab-content">
              <Readme
                pkg={pkg || ({} as GetPackageResponse)}
                readme={readme}
                source="github"
              />
            </div>
          </Card>
        </motion.div>
      </Tab>
      <Tab key="versions" title="Versions">
        <motion.div
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          {pkg ? (
            <VersionCard pkg={pkg} />
          ) : (
            <div>No version data available</div>
          )}
        </motion.div>
      </Tab>

      <Tab
        key="project"
        href={pkg.projectUrl}
        title={
          <span className="flex items-center gap-1">
            Project <FaLink size={12} />
          </span>
        }
      />
    </Tabs>
  );
}
