"use client";

import { usePathname } from "next/navigation";
import { Folder } from "lucide-react";

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const formatSegment = (seg: string) =>
    seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 lg:mt-4 mt-15">
      <Folder className="w-4 h-4" />
      {segments.map((seg, index) => (
        <span key={index}>/ {formatSegment(seg)}</span>
      ))}
    </div>
  );
}
