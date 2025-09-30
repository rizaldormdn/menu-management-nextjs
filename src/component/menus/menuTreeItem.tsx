/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  createChildMenuItem,
  MenuItem,
  setSelectedItem,
  toggleExpanded,
} from "@/lib/store/slice/menuSlice";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { CreateChildMenuForm } from "./form/createChildMenuForm";

interface TreeItemProps {
  node: MenuItem;
  level: number;
  isLast?: boolean;
  parentLines?: boolean[];
}

export function MenuTreeItem({ node, level }: TreeItemProps) {
  const dispatch = useAppDispatch();
  const { selectedItem, expandedItems, loading } = useAppSelector(
    (state) => state.menu
  );

  const [showForm, setShowForm] = useState(false);

  const isExpanded = expandedItems.includes(node.id);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedItem?.id === node.id;

  const handleSelect = () => {
    dispatch(setSelectedItem(node));
  };

  const handleToggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleExpanded(node.id));
  };

  const handleAddChildClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowForm(true);
  };

  const handleFormSubmit = async (formData: {
    name: string;
    code: string;
    path: string;
    icon: string;
    isActive: boolean;
    order: number;
  }) => {
    try {
      await dispatch(
        createChildMenuItem({
          parentId: node.id,
          data: formData,
        })
      ).unwrap();
      setShowForm(false);
    } catch (error) {
      console.error("Failed to create child menu:", error);
      alert("Failed to create child menu: " + (error as Error).message);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  // Format display name - remove dots and capitalize
  const formatDisplayName = (name: string | undefined) => {
    if (!name) return "";
    return name
      .split(".")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  return (
    <>
      <div
        className={cn(
          "flex items-center py-1 px-1 cursor-pointer hover:bg-gray-50 text-sm group",
          isSelected && "bg-blue-50 text-blue-700"
        )}
        style={{ paddingLeft: `${level * 20 + 4}px` }}
        onClick={handleSelect}
      >
        {/* Expand/Collapse Button atau Spacer */}
        {hasChildren ? (
          <button
            onClick={handleToggleExpanded}
            className="p-0.5 hover:bg-gray-200 rounded flex-shrink-0 w-4 h-4 flex items-center justify-center mr-1"
            disabled={loading}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-gray-600" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-600" />
            )}
          </button>
        ) : (
          <div className="w-4 h-4 flex-shrink-0 mr-1" />
        )}

        {/* Container untuk nama dan icon dengan flex yang tepat */}
        <div className="flex items-center flex-1 min-w-0">
          {/* Menu Item Name */}
          <span
            className={cn(
              "truncate text-xs",
              isSelected ? "text-blue-700 font-medium" : "text-gray-800"
            )}
          >
            {formatDisplayName(node.name)}
          </span>

          {/* Add Child Button - hanya untuk items yang bisa punya children */}
          <button
            onClick={handleAddChildClick}
            className={cn(
              "p-1 hover:bg-blue-700 cursor-pointer rounded-full flex-shrink-0 w-5 h-5 flex items-center justify-center transition-opacity ml-2",
              isSelected
                ? "opacity-100 text-blue-600"
                : "opacity-0 group-hover:opacity-100 text-white bg-blue-700",
              loading && "opacity-50 cursor-not-allowed"
            )}
            title="Tambah Child Menu"
            disabled={loading}
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Modal Popup untuk Form */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Create Menu Item
                </h3>
                <button
                  onClick={handleFormCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <CreateChildMenuForm
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                loading={loading}
                parentItem={{
                  name: node.name || "",
                  path: node.path,
                  childrenCount: node.children ? node.children.length : 0,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Children Items */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child: any, index: any) => (
            <MenuTreeItem
              key={`child-${child.id}-${index}`}
              node={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </>
  );
}
