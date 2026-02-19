import * as React from "react";

const cn = (...inputs: (string | undefined | null | false)[]) => {
  return inputs.filter(Boolean).join(" ");
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  let variantStyles = "";
  switch (variant) {
    case "secondary":
      variantStyles =
        "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-800/80";
      break;
    case "destructive":
      variantStyles =
        "border-transparent bg-red-500 text-gray-50 shadow hover:bg-red-500/80 dark:bg-red-900 dark:text-gray-50 dark:hover:bg-red-900/80";
      break;
    case "outline":
      variantStyles = "text-gray-950 dark:text-gray-50";
      break;
    default:
      variantStyles =
        "border-transparent bg-gray-900 text-gray-50 shadow hover:bg-gray-900/80 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/80";
      break;
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 dark:border-gray-800 dark:focus:ring-gray-300",
        variantStyles,
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
