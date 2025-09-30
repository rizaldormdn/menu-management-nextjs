"use client";

import { useAppSelector } from "@/lib/store/hooks";
import { MenuTreeItem } from "./menuTreeItem";

export function MenuTreeView() {
  const { items, loading } = useAppSelector((state) => state.menu);

  if (loading) {
    return (
      <div className="bg-white p-4">
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="h-8 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white p-8 text-center text-gray-500">
        No menu items available
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {items.map((item) => (
          <MenuTreeItem key={item.id} node={item} level={0} />
        ))}
      </div>
    </div>
  );
}
