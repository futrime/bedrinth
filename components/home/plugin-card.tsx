"use client";

import type { SearchPackagesResponse } from "../../lib/api";

import { Card, CardBody, CardFooter } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Image } from "@heroui/image";
import { IoMdStarOutline } from "react-icons/io";
import { MdUpdate } from "react-icons/md";

const colors = [
  "primary",
  "secondary",
  "success",
  "warning",
  "danger",
] as const;

type ResultItem = SearchPackagesResponse["items"][number];

export default function PluginCard({ result }: { result: ResultItem }) {
  let colorIndex = 0;

  const getNextColor = () => {
    const color = colors[colorIndex];

    colorIndex = (colorIndex + 1) % colors.length;

    return color;
  };

  const categoryTags = new Map<string, string[]>();
  const otherTag: string[] = [];

  for (const item of result.tags) {
    const category = /^[a-z0-9-]+:[a-z0-9-]+$/.test(item)
      ? item.split(":")[0]
      : "";

    if (category !== "") {
      if (!categoryTags.has(category)) {
        categoryTags.set(category, []);
      }
      categoryTags.get(category)!.push(item.split(":")[1]);
    } else {
      otherTag.push(item);
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <a href={`/packages/${result.identifier}`}>
      <Card
        fullWidth
        isHoverable
        isPressable
        className="border-none bg-background/60 dark:bg-default-100/50 plugin-card w-full"
        shadow="sm"
      >
        <CardBody>
          <div className="flex overflow-x-hidden">
            <div className="flex-shrink-0 p-4 hidden md:flex">
              <Image
                alt="avatar"
                className="rounded-3xl"
                height={80}
                src={
                  result?.avatarUrl ||
                  "https://stickerly.pstatic.net/sticker_pack/8cP1NeB69qFawu3Cn0vA/SL4DEZ/20/5e094b29-a0b9-4c95-8359-71af47910afb.png"
                }
                width={80}
              />
            </div>

            <div className="flex-grow p-4 min-w-0">
              <div className="flex flex-col h-full">
                <div className="mb-2">
                  <h3 className="font-semibold text-foreground/90">
                    <span className="text-large">
                      <span className="text-foreground text-lg">
                        {result.author}
                      </span>
                      &nbsp;/&nbsp;
                      <span className="text-foreground text-lg">
                        {result.name}
                      </span>
                    </span>
                  </h3>
                  <p className="text-medium text-foreground/80">
                    {result.description}
                  </p>
                </div>
                <div className="mt-[10px] flex gap-4 items-center flex-wrap">
                  {Array.from(
                    categoryTags.entries().map(([key, values]) => (
                      <Chip
                        key={key}
                        color={getNextColor()}
                        size="sm"
                        variant="solid"
                      >
                        {`${key}:${values.join(" | ")}`}
                      </Chip>
                    )),
                  )}
                  {otherTag.map((item) => (
                    <Chip
                      key={item}
                      color={getNextColor()}
                      size="sm"
                      variant="bordered"
                    >
                      {item}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 p-4 min-w-[150px] md:pl-4 hidden md:flex">
              <div className="hidden md:flex flex-col items-end">
                <span className="flex items-center gap-1 align-middle">
                  <IoMdStarOutline size={24} /> {result.hotness} Stars
                </span>
                <span className="flex items-center gap-1 align-middle">
                  <MdUpdate size={24} />
                  {formatDate(result.updated)}
                </span>
              </div>
            </div>
          </div>
        </CardBody>
        <CardFooter className="flex md:hidden">
          <div className="flex md:hidden flex-row items-center gap-4 justify-start">
            <IoMdStarOutline size={24} />
            {result.hotness}
            <MdUpdate size={24} /> {formatDate(result.updated)}
          </div>
        </CardFooter>
      </Card>
    </a>
  );
}
