import { useState, useEffect } from "react";
import { MenuResponseDto } from "../api/types/menu-types";
import { apiService } from "../api/menu-service";
import { MenuItemHierarchyDto } from "../api/types/menu-item-types";

export const useMenus = () => {
  const [menus, setMenus] = useState<MenuResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const data = await apiService.getActiveMenus();
      setMenus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch menus");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  return {
    menus,
    loading,
    error,
    refetch: fetchMenus,
  };
};

export const useMenuHierarchy = (menuId: string) => {
  const [hierarchy, setHierarchy] = useState<MenuItemHierarchyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHierarchy = async () => {
    if (!menuId) return;

    try {
      setLoading(true);
      const data = await apiService.getMenuHierarchy(menuId);
      setHierarchy(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch menu hierarchy"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchy();
  }, [menuId]);

  return {
    hierarchy,
    loading,
    error,
    refetch: fetchHierarchy,
  };
};
