"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectItem } from "@heroui/react";
import React from "react";
import { Selection } from "@heroui/react";

const statusOptions = [
  { label: "LeviLamina", key: "levilamina" },
  { label: "Endstone", key: "endstone" },
];

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function PlatformSort({ platform }: { platform: string }) {
  const platformArr = platform.split(",");

  const [values, setValues] = React.useState<Selection>(
    platform === "all"
      ? new Set(statusOptions.map((opt) => opt.key))
      : new Set(platformArr),
  );

  const searchParams = useSearchParams();
  const { replace } = useRouter();

  return (
    <Select
      disallowEmptySelection
      className="max-w-xs"
      label="Platform"
      placeholder="Select an Platform"
      selectedKeys={values}
      selectionMode="multiple"
      onSelectionChange={(keys) => {
        setValues(keys);
        const params = new URLSearchParams(searchParams);

        params.set("platform", Array.from(keys).join(","));
        replace(`/?${params.toString()}`);
      }}
    >
      {statusOptions.map((ops) => (
        <SelectItem key={ops.key}>{ops.label}</SelectItem>
      ))}
    </Select>
  );
}
