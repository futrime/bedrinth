"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, Tab } from "@heroui/react";
import React from "react";

export function TabsContent({ tab }: { tab: string }) {
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  return (
    <Tabs
      aria-label="Tabs variants"
      selectedKey={tab}
      variant="light"
      onSelectionChange={(sort) => {
        const params = new URLSearchParams(searchParams);

        params.set("sort", sort.toString());
        replace(`/?${params.toString()}`);
      }}
    >
      <Tab key="hotness" title="Stars" />
      <Tab key="updated" title="Date Updated" />
    </Tabs>
  );
}
