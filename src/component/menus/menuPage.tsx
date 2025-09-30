"use client";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  clearError,
  collapseAll,
  expandAll,
  fetchMenus,
} from "@/lib/store/slice/menuSlice";
import { Grid3X3 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { MenuTreeItem } from "./menuTreeItem";

interface Menu {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export function MenusPage() {
  const dispatch = useAppDispatch();
  const { items, loading, selectedItem, error } = useAppSelector(
    (state) => state.menu
  );
  const [selectedMenuId, setSelectedMenuId] = useState<string>("");
  const [menus, setMenus] = useState<Menu[]>([]);
  const [menusLoading, setMenusLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadMenus = async () => {
      try {
        setMenusLoading(true);
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
          }/menus/active`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch menus: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && Array.isArray(result.data) && isMounted) {
          setMenus(result.data);
          if (result.data.length > 0) {
            const firstMenuId = result.data[0].id;
            setSelectedMenuId(firstMenuId);
            dispatch(fetchMenus(firstMenuId));
          }
        } else {
          if (isMounted) setMenus([]);
        }
      } catch (error) {
        console.error("Failed to load menus:", error);
        if (isMounted) setMenus([]);
      } finally {
        if (isMounted) setMenusLoading(false);
      }
    };

    loadMenus();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  useEffect(() => {
    if (selectedMenuId) {
      dispatch(fetchMenus(selectedMenuId));
    }
  }, [selectedMenuId, dispatch]);

  const handleMenuChange = useCallback((menuId: string) => {
    setSelectedMenuId(menuId);
  }, []);

  const handleExpandAll = useCallback(() => {
    dispatch(expandAll());
  }, [dispatch]);

  const handleCollapseAll = useCallback(() => {
    dispatch(collapseAll());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch, selectedMenuId]);

  const MenuSelector = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={isMobile ? "" : "mt-7"}>
      {!isMobile && (
        <Label className="block text-sm font-medium text-gray-700 mb-1">
          Menu
        </Label>
      )}
      <Select value={selectedMenuId} onValueChange={handleMenuChange}>
        <SelectTrigger
          className={
            isMobile
              ? "w-full bg-gray-100 text-black border border-gray-300 rounded-xl h-9 text-sm"
              : "w-64 bg-gray-100 border-gray-100 rounded-xl h-10 text-sm text-black"
          }
          disabled={menusLoading || menus.length === 0 || loading}
        >
          <SelectValue
            placeholder={
              menusLoading ? "Loading menus..." : "No menus available"
            }
          />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {menusLoading ? (
            <SelectItem key="loading" value="loading" disabled>
              Loading menus...
            </SelectItem>
          ) : menus.length === 0 ? (
            <SelectItem key="no-menus" value="no-menus" disabled></SelectItem>
          ) : (
            menus.map((menu) => (
              <SelectItem key={menu.id} value={menu.id} className="text-black">
                {menu.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );

  const ActionButtons = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div
      className={`flex items-center gap-2 ${isMobile ? "" : "px-4 mt-4 mb-4"}`}
    >
      <Button
        onClick={handleExpandAll}
        className={
          isMobile
            ? "bg-gray-800 hover:bg-gray-700 text-white text-xs px-3 h-8 rounded-full flex-1"
            : "bg-gray-800 hover:bg-gray-700 text-white text-xs px-3 h-8 rounded-full w-32" // Fixed styling
        }
        size="sm"
        disabled={loading}
      >
        Expand All
      </Button>
      <Button
        onClick={handleCollapseAll}
        className={
          isMobile
            ? "bg-gray-800 hover:bg-gray-700 text-white text-xs px-3 h-8 rounded-full flex-1"
            : "bg-gray-800 hover:bg-gray-700 text-white text-xs px-3 h-8 rounded-full w-32" // Fixed styling
        }
        size="sm"
        disabled={loading}
      >
        Collapse All
      </Button>
    </div>
  );

  return (
    <div className="bg-white flex flex-col h-screen">
      {" "}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <strong>Error: </strong> {error}
          <button
            onClick={() => dispatch(clearError())}
            className="float-right font-bold ml-4"
          >
            ×
          </button>
        </div>
      )}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="w-full lg:w-1/2 bg-white flex flex-col min-h-0">
          <div className="hidden lg:block px-4 py-4 flex-shrink-0">
            {/* Page Title */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Grid3X3 className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Menus</h1>
            </div>

            {/* Menu Selector - Desktop */}
            <MenuSelector />
          </div>
          {/* Action Buttons - Desktop */}
          <div className="hidden lg:block flex-shrink-0">
            <ActionButtons />
          </div>
          {/* Mobile Controls */}
          <div className="lg:hidden px-4 py-3 border-b border-gray-200 space-y-3 flex-shrink-0">
            {/* Menu Selector - Mobile */}
            <MenuSelector isMobile />

            {/* Action Buttons - Mobile */}
            <ActionButtons isMobile />
          </div>
          {/* Tree Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="h-6 bg-gray-200 rounded animate-pulse"
                  ></div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="text-center text-gray-500 py-8"></div>
            ) : (
              <div className="space-y-1">
                {items.map((item) => (
                  <MenuTreeItem
                    key={`menu-item-${item.id}`}
                    node={item}
                    level={0}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Right Panel - Details Form */}
        <div className="w-full lg:w-1/2 flex flex-col min-h-0 mt-17">
          {" "}
          {/* Added border and background */}
          <div className="hidden lg:block h-20 flex-shrink-0"></div>{" "}
          {/* Details Form */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 lg:px-6 py-4">
            {selectedItem ? (
              <div className="space-y-4">
                {/* Menu ID */}
                <div>
                  <Label className="text-sm text-gray-700 mb-2">Menu ID</Label>
                  <Input
                    value={selectedItem.id}
                    readOnly
                    className="w-full text-sm text-gray-600 bg-white border-gray-300 rounded-lg"
                  />
                </div>

                {/* Depth */}
                <div>
                  <Label className="text-sm text-gray-700 mb-2">Depth</Label>
                  <Input
                    value={selectedItem.depth.toString()}
                    readOnly
                    className="w-full text-sm text-gray-600 bg-white border-gray-300 rounded-lg"
                  />
                </div>

                {/* Name */}
                <div>
                  <Label className="text-sm text-gray-700 mb-2">
                    Parent Data
                  </Label>
                  <Input
                    value={selectedItem.parentName}
                    readOnly
                    className="w-full text-sm text-gray-600 bg-white border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <Label className="text-sm text-gray-700 mb-2">Name</Label>
                  <Input
                    value={selectedItem.name}
                    readOnly
                    className="w-full text-sm text-gray-600 bg-white border-gray-300 rounded-lg"
                  />
                </div>

                {/* Save Button */}
                <Button className="w-60 bg-blue-600 hover:bg-blue-700 text-white py-2.5 font-medium">
                  Save Changes
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
