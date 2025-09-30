/* eslint-disable @typescript-eslint/no-explicit-any */
import { MenuResponseDto } from "./types/menu-types";
import {
  MenuItemResponseDto,
  MenuItemHierarchyDto,
} from "./types/menu-item-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Interface untuk response wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class ApiService {
  private async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `API Error: ${response.status} ${response.statusText}`
        );
      }

      const result: ApiResponse<T> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "API request failed");
      }

      return result.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred");
    }
  }

  // Menu APIs
  async getMenus(): Promise<MenuResponseDto[]> {
    return this.fetchApi<MenuResponseDto[]>("/menus");
  }

  async getActiveMenus(): Promise<MenuResponseDto[]> {
    return this.fetchApi<MenuResponseDto[]>("/menus/active");
  }

  async getMenuById(id: string): Promise<MenuResponseDto> {
    return this.fetchApi<MenuResponseDto>(`/menus/${id}`);
  }

  async createMenu(data: any): Promise<MenuResponseDto> {
    return this.fetchApi<MenuResponseDto>("/menus", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateMenu(id: string, data: any): Promise<MenuResponseDto> {
    return this.fetchApi<MenuResponseDto>(`/menus/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteMenu(id: string): Promise<void> {
    return this.fetchApi<void>(`/menus/${id}`, {
      method: "DELETE",
    });
  }

  // Menu Item APIs
  async getMenuItems(): Promise<MenuItemResponseDto[]> {
    return this.fetchApi<MenuItemResponseDto[]>("/menu-items");
  }

  async getMenuItemsByMenu(menuId: string): Promise<MenuItemResponseDto[]> {
    return this.fetchApi<MenuItemResponseDto[]>(`/menu-items/menu/${menuId}`);
  }

  async getMenuHierarchy(menuId: string): Promise<MenuItemHierarchyDto[]> {
    return this.fetchApi<MenuItemHierarchyDto[]>(`/menu-items/hierarchy/all`);
  }

  async getMenuItemById(id: string): Promise<MenuItemResponseDto> {
    return this.fetchApi<MenuItemResponseDto>(`/menu-items/${id}`);
  }

  async createMenuItem(data: any): Promise<MenuItemResponseDto> {
    return this.fetchApi<MenuItemResponseDto>("/menu-items", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateMenuItem(id: string, data: any): Promise<MenuItemResponseDto> {
    return this.fetchApi<MenuItemResponseDto>(`/menu-items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async updateMenuItemOrder(
    id: string,
    order: number
  ): Promise<MenuItemResponseDto> {
    return this.fetchApi<MenuItemResponseDto>(`/menu-items/${id}/order`, {
      method: "PATCH",
      body: JSON.stringify({ order }),
    });
  }

  async deleteMenuItem(id: string): Promise<void> {
    return this.fetchApi<void>(`/menu-items/${id}`, {
      method: "DELETE",
    });
  }
}

export const apiService = new ApiService();
