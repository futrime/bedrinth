"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Spinner } from "@nextui-org/react";
import { debounce } from "lodash";
import { Helmet } from "react-helmet";

import { PaginationComponent } from "../components/home/pagination";
import PluginCard from "../components/home/plugin-card";
import { SearchPackagesResponse } from "../lib/api";

import { title, subtitle } from "@/components/primitives";
import { searchPackages } from "@/lib/api";
import { TabsContent } from "@/components/home/tabs";
import { PlatformSort } from "@/components/home/platform-sort";
import { InputSort } from "@/components/home/input";

const words = ["levilamina mods", "endstone plugins"];

type Color = "violet" | "yellow" | "blue" | "cyan" | "green" | "pink";

const colors: Color[] = ["violet", "yellow", "blue", "cyan", "green", "pink"];

export default function Page({
  searchParams,
}: Readonly<{
  searchParams?: {
    q?: string;
    page?: number;
    sort?: "hotness" | "updated";
    platform?: string;
  };
}>) {
  const [index, setIndex] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  const [packages, setPackages] = useState<SearchPackagesResponse | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
      setColorIndex((prevIndex) => (prevIndex + 1) % colors.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const q = useMemo(() => {
    let query = "";

    if (searchParams?.platform) {
      const platformArr = searchParams.platform.split(",");

      if (platformArr.length > 0) {
        query += "platform:" + platformArr.join(" platform:");
      }
    }
    if (searchParams?.q) {
      query += ` ${searchParams.q}`;
    }

    return query;
  }, [searchParams]);

  const fetchPackages = useMemo(
    () =>
      debounce(async () => {
        const result = await searchPackages(
          q,
          undefined,
          searchParams?.page,
          searchParams?.sort,
        );

        setPackages(result);
      }, 300),
    [q, searchParams?.page, searchParams?.sort],
  );

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  return (
    <div className="container mx-auto max-w-7xl px-6 flex-grow">
      <Helmet>
        <title>Bedrinth</title>
        <meta
          name="description"
          content="The Minecraft Bedrock mod index"
        />
        <meta property="og:title" content="Bedrinth" />
        <meta
          property="og:description"
          content="The Minecraft Bedrock mod index"
        />
        <meta property="og:type" content="website" />
      </Helmet>      
      <div>
        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-center justify-center"
            initial={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <span className={title()}>Find your favorite</span>
            <br />

            <motion.span
              animate={{ opacity: 1 }}
              className={`${title({ color: colors[colorIndex] })} fade-in-out`}
              initial={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              {words[index]} 
            </motion.span>

            <span className={subtitle()}>
              Bedrinth is our dedicated mod repository! You can explore various
              mods specifically for LeviLamina or Endstone, or list your own
              mods through a streamlined creation process.
            </span>
            <br />
          </motion.div>

          <motion.div
            animate={{ opacity: 1 }}
            className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4"
            initial={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <InputSort q={searchParams?.q || ""} />
          </motion.div>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <TabsContent tab={searchParams?.sort || "hotness"} />
          </motion.div>
        </section>
      </div>

      <div className="flex items-center space-x-4">
        <h2 className="font-bold text-2xl">Projects</h2>
        <PlatformSort platform={searchParams?.platform || "all"} />
      </div>
      <br />
      {!packages ? (
        <div className="flex items-center justify-center ">
          <Spinner color="default" label="Loading" size="lg" />
        </div>
      ) : (
        <>
          <motion.div
            animate="visible"
            initial="hidden"
            variants={{
              hidden: { opacity: 1 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.3,
                },
              },
            }}
          >
            {packages.items.map((item, index) => (
              <motion.div
                key={index}
                transition={{ duration: 0.5 }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <PluginCard result={item} />
              </motion.div>
            ))}
          </motion.div>
          <PaginationComponent
            pageIndex={packages.pageIndex}
            totalPages={packages.totalPages}
          />
        </>
      )}
    </div>
  );
}
