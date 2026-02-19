"use client";

import {
  Box,
  Package,
  Layers,
  Code,
  Cpu,
  Database,
  Globe,
  Server,
  Terminal,
  Zap,
  Archive,
  Component,
  Container,
  FileCode,
  FolderGit,
} from "lucide-react";
import { useState } from "react";

// Array of icons to choose from
const ICONS = [
  Box,
  Package,
  Layers,
  Code,
  Cpu,
  Database,
  Globe,
  Server,
  Terminal,
  Zap,
  Archive,
  Component,
  Container,
  FileCode,
  FolderGit,
];

// Determine color class based on hash
const COLORS = [
  "text-red-500 bg-red-100 dark:bg-red-900/20",
  "text-orange-500 bg-orange-100 dark:bg-orange-900/20",
  "text-amber-500 bg-amber-100 dark:bg-amber-900/20",
  "text-green-500 bg-green-100 dark:bg-green-900/20",
  "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/20",
  "text-teal-500 bg-teal-100 dark:bg-teal-900/20",
  "text-cyan-500 bg-cyan-100 dark:bg-cyan-900/20",
  "text-blue-500 bg-blue-100 dark:bg-blue-900/20",
  "text-indigo-500 bg-indigo-100 dark:bg-indigo-900/20",
  "text-violet-500 bg-violet-100 dark:bg-violet-900/20",
  "text-purple-500 bg-purple-100 dark:bg-purple-900/20",
  "text-fuchsia-500 bg-fuchsia-100 dark:bg-fuchsia-900/20",
  "text-pink-500 bg-pink-100 dark:bg-pink-900/20",
  "text-rose-500 bg-rose-100 dark:bg-rose-900/20",
];

interface AvatarProps {
  src?: string;
  alt: string;
  name: string;
  // tooth is no longer needed for github fallback, but we keep the prop signature compatible
  tooth?: string;
  className?: string;
}

export function Avatar({ src, alt, name, className }: AvatarProps) {
  const [error, setError] = useState(false);

  if (src && !error) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={`object-contain bg-gray-50 dark:bg-gray-900 border shrink-0 ${className}`}
        onError={() => setError(true)}
      />
    );
  }

  // Deterministic hash from name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const iconIndex = Math.abs(hash) % ICONS.length;
  const colorIndex = Math.abs(hash) % COLORS.length;

  const Icon = ICONS[iconIndex];
  const colorClass = COLORS[colorIndex];

  return (
    <div
      className={`border flex items-center justify-center shrink-0 ${colorClass} ${className}`}
    >
      <Icon className="w-1/2 h-1/2" />
    </div>
  );
}
