"use client";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationItemType,
  PaginationItemRenderProps,
  cn,
} from "@heroui/react";
import { SVGProps } from "react";

type IconSvgProps = SVGProps<SVGSVGElement>;
export const ChevronIcon = (props: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M15.5 19l-7-7 7-7"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
);

export function PaginationComponent({
  pageIndex,
  totalPages,
}: {
  pageIndex: number;
  totalPages: number;
}) {
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  const renderItem = ({
    ref,
    key,
    value,
    isActive,
    onNext,
    onPrevious,
    setPage,
    className,
  }: PaginationItemRenderProps) => {
    if (value === PaginationItemType.NEXT) {
      return (
        <button
          key={key}
          className={cn(className, "bg-default-200/50 min-w-8 w-8 h-8")}
          onClick={() => {
            onNext();
            const params = new URLSearchParams(searchParams);

            params.set("page", (pageIndex + 1).toString());
            replace(`/?${params.toString()}`);
          }}
        >
          <ChevronIcon className="rotate-180" />
        </button>
      );
    }

    if (value === PaginationItemType.PREV) {
      return (
        <button
          key={key}
          className={cn(className, "bg-default-200/50 min-w-8 w-8 h-8")}
          onClick={() => {
            onPrevious();
            const params = new URLSearchParams(searchParams);

            params.set("page", (pageIndex - 1).toString());
            replace(`/?${params.toString()}`);
          }}
        >
          <ChevronIcon />
        </button>
      );
    }

    if (value === PaginationItemType.DOTS) {
      return (
        <button key={key} className={className}>
          ...
        </button>
      );
    }

    return (
      <button
        key={key}
        ref={ref}
        className={cn(
          className,
          isActive &&
            "text-white bg-gradient-to-br from-indigo-500 to-pink-500 font-bold",
        )}
        onClick={() => {
          setPage(value);
          const params = new URLSearchParams(searchParams);

          params.set("page", value.toString());
          replace(`/?${params.toString()}`);
        }}
      >
        {value}
      </button>
    );
  };

  if (totalPages > 1) {
    return (
      <div className="flex justify-center">
        <Pagination
          disableCursorAnimation
          showControls
          className="gap-2"
          initialPage={pageIndex}
          radius="full"
          renderItem={renderItem}
          total={totalPages}
          variant="light"
        />
      </div>
    );
  } else {
    return <></>;
  }
}
