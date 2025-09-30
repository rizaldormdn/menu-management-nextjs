"use client";

import { useAppDispatch } from "@/lib/store/hooks";
import { collapseAll, expandAll } from "@/lib/store/slice/menuSlice";
import { Grid3X3 } from "lucide-react";
import { Button } from "../ui/button";

export function MenuHeader() {
  const dispatch = useAppDispatch();

  const handleExpandAll = () => {
    dispatch(expandAll());
  };

  const handleCollapseAll = () => {
    dispatch(collapseAll());
  };

  return (
    <div className="bg-white px-6 py-4">
      {/* Page Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <Grid3X3 className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Menus</h1>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleExpandAll}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 h-8 rounded-full" // Tambahkan background color
        >
          Expand All
        </Button>
        <Button
          onClick={handleCollapseAll}
          className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-4 h-8 rounded-full" // Tambahkan background color
        >
          Collapse All
        </Button>
      </div>
    </div>
  );
}
