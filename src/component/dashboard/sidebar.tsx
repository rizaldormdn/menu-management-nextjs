/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ChevronDown, ChevronRight, X, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useSidebar } from "@/lib/context/sidebar-context";

// Improved Type Definitions
interface BaseMenuItem {
  id: string;
  name: string;
  code?: string;
  depth: number;
  order: number;
  isActive: boolean;
  icon?: string;
}

interface NavigableMenuItem extends BaseMenuItem {
  path: string;
  children?: never;
}

interface ParentMenuItem extends BaseMenuItem {
  path?: never;
  children: SidebarMenuItem[];
}

type SidebarMenuItem = NavigableMenuItem | ParentMenuItem;

// Custom hook for mobile detection
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();

    const resizeHandler = () => {
      checkMobile();
    };

    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  return isMobile;
};

// Memoized Menu Item Component
interface MenuItemProps {
  item: SidebarMenuItem;
  level: number;
  isExpanded: boolean;
  isActive: boolean;
  onItemClick: (item: SidebarMenuItem) => void;
  onChevronClick: (itemId: string, e: React.MouseEvent) => void;
}

const MenuItemComponent = React.memo<MenuItemProps>(
  ({ item, level, isExpanded, isActive, onItemClick, onChevronClick }) => {
    const hasChildren =
      "children" in item && item.children && item.children.length > 0;
    const paddingLeft = 12 + level * 16;

    return (
      <div className="select-none">
        {/* Menu Item */}
        <div
          className={cn(
            "flex items-center gap-3 py-2.5 rounded-md cursor-pointer transition-all duration-200 text-sm",
            isActive
              ? "bg-green-500 text-white shadow-sm"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          )}
          style={{ paddingLeft: `${paddingLeft}px`, paddingRight: "12px" }}
          onClick={() => onItemClick(item)}
        >
          {/* Icon */}
          {item.icon && (
            <span className="text-base flex-shrink-0 w-5 text-center">
              {item.icon}
            </span>
          )}

          {/* Name */}
          <span
            className={cn("font-medium flex-1 truncate", !item.icon && "ml-1")}
          >
            {item.name}
          </span>

          {/* Chevron untuk items yang memiliki children */}
          {hasChildren && (
            <button
              onClick={(e) => onChevronClick(item.id, e)}
              className={cn(
                "p-1 rounded flex-shrink-0 transition-colors",
                isActive ? "hover:bg-green-600" : "hover:bg-slate-700"
              )}
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          )}
        </div>

        {/* Children Items */}
        {hasChildren && isExpanded && (
          <div className="overflow-hidden">
            {item.children!.map((child) => (
              <MenuItemComponent
                key={child.id}
                item={child}
                level={level + 1}
                isExpanded={isExpanded}
                isActive={isActive}
                onItemClick={onItemClick}
                onChevronClick={onChevronClick}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

MenuItemComponent.displayName = "MenuItemComponent";

const sidebarApiService = {
  async getActiveMenus() {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      }/menus/active`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch menus: ${response.status}`);
    }

    return response.json();
  },

  async getMenuHierarchy(menuId: string) {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      }/menu-items/menu/${menuId}/hierarchy`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch hierarchy: ${response.status}`);
    }

    return response.json();
  },
};

// Mobile Toggle Button Component (untuk digunakan di layout utama)
export function SidebarToggle() {
  const { isOpen, setIsOpen } = useSidebar();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="lg:hidden p-2 rounded-md  text-black hover:bg-slate-700 transition-colors fixed top-4 left-4 z-50"
      aria-label="Toggle sidebar"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}

export function Sidebar() {
  const { isOpen, setIsOpen } = useSidebar();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [menuData, setMenuData] = useState<SidebarMenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const isMobile = useIsMobile();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    const loadSidebarMenu = async () => {
      try {
        if (!isMounted) return;

        setLoading(true);
        setError(null);

        const menusResult = await sidebarApiService.getActiveMenus();

        // Cari menu dengan nama yang cocok untuk sidebar
        let targetMenu = menusResult.data?.find(
          (menu: any) =>
            menu.name.toLowerCase().includes("sidebar") ||
            menu.name.toLowerCase().includes("main") ||
            menu.name.toLowerCase().includes("navigation")
        );

        // Jika tidak ditemukan, gunakan menu pertama yang aktif
        if (!targetMenu && menusResult.data && menusResult.data.length > 0) {
          targetMenu = menusResult.data[0];
        }

        if (!targetMenu) {
          throw new Error("No active menus found");
        }

        await loadMenuHierarchy(targetMenu.id);

        // Reset retry count on success
        setRetryCount(0);
      } catch (error) {
        if (!isMounted) return;

        console.error("Failed to load sidebar menu:", error);

        // Retry logic
        if (retryCount < 3) {
          setTimeout(() => {
            if (isMounted) {
              setRetryCount((prev) => prev + 1);
            }
          }, 1000 * retryCount);
        } else {
          setError(error instanceof Error ? error.message : "Unknown error");
          setMenuData([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const loadMenuHierarchy = async (menuId: string) => {
      try {
        const hierarchyResult = await sidebarApiService.getMenuHierarchy(
          menuId
        );

        if (hierarchyResult.success && Array.isArray(hierarchyResult.data)) {
          if (!isMounted) return;

          setMenuData(hierarchyResult.data);

          // Auto-expand root items yang memiliki children
          const rootItemsWithChildren = hierarchyResult.data
            .filter(
              (item: SidebarMenuItem) =>
                "children" in item && item.children && item.children.length > 0
            )
            .map((item: SidebarMenuItem) => item.id);

          setExpandedItems(rootItemsWithChildren);
        } else {
          throw new Error("Invalid hierarchy data format");
        }
      } catch (error) {
        console.error("Failed to load menu hierarchy:", error);
        throw error;
      }
    };

    loadSidebarMenu();

    return () => {
      isMounted = false;
    };
  }, [retryCount]);

  const toggleExpanded = useCallback((itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  // Fungsi isActive yang benar - hanya exact match
  const isActive = useCallback(
    (item: SidebarMenuItem): boolean => {
      if (!("path" in item) || !item.path) return false;
      return pathname === item.path;
    },
    [pathname]
  );

  const handleItemClick = useCallback(
    (item: SidebarMenuItem) => {
      if ("path" in item && item.path) {
        router.push(item.path);
        if (isMobile) {
          setIsOpen(false);
        }
      } else if (
        "children" in item &&
        item.children &&
        item.children.length > 0
      ) {
        toggleExpanded(item.id);
      }
    },
    [router, isMobile, setIsOpen, toggleExpanded]
  );

  const handleChevronClick = useCallback(
    (itemId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      toggleExpanded(itemId);
    },
    [toggleExpanded]
  );

  const renderedMenuItems = useMemo(() => {
    if (!menuData.length) return null;

    return menuData.map((item) => (
      <MenuItemComponent
        key={item.id}
        item={item}
        level={0}
        isExpanded={expandedItems.includes(item.id)}
        isActive={isActive(item)}
        onItemClick={handleItemClick}
        onChevronClick={handleChevronClick}
      />
    ));
  }, [menuData, expandedItems, isActive, handleItemClick, handleChevronClick]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out",
          "lg:rounded-2xl lg:m-4 lg:translate-x-0",
          isMobile
            ? isOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <Image src="/image.png" width={70} height={21} alt="Logo" />
            {isMobile && (
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-800 rounded transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 px-3">
                  <div className="w-4 h-4 bg-slate-700 rounded animate-pulse" />
                  <div className="h-4 bg-slate-700 rounded animate-pulse flex-1" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-3 text-center text-slate-400 text-sm">
              <div>Failed to load menu</div>
              <div className="text-xs mt-1 text-red-400">{error}</div>
              {retryCount > 0 && (
                <button
                  onClick={() => setRetryCount(0)}
                  className="mt-2 px-3 py-1 bg-slate-700 rounded text-xs hover:bg-slate-600 transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          ) : menuData.length === 0 ? (
            <div className="p-3 text-center text-slate-400 text-sm">
              No menu items available
            </div>
          ) : (
            renderedMenuItems
          )}
        </nav>
      </div>
    </>
  );
}
