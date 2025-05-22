"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@heroui/input";
import { Icon } from "@iconify/react";
import React from "react";

export function InputSort({}: { q: string }) {
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  return (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-content2 dark:bg-content1",
      }}
      labelPlacement="outside"
      placeholder="Search in Bedrinth..."
      radius="lg"
      startContent={
        <Icon
          className="text-default-500"
          icon="solar:magnifer-linear"
          width={20}
        />
      }
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams);

        params.set("q", value);
        params.delete("page");
        replace(`/?${params.toString()}`);
      }}
    />
  );
}
