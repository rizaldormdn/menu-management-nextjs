/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Centralized API Service
const menuApiService = {
  async getMenuHierarchy(menuId: string) {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      }/menu-items/menu/${menuId}/hierarchy`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async createMenuItem(data: unknown) {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      }/menu-items`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async updateMenuItem(id: string, data: any) {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      }/menu-items/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async deleteMenuItem(id: string) {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      }/menu-items/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async createChildMenuItem(parentId: string, data: any) {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      }/menu-items/${parentId}/children`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

// Improved Type Definitions
interface BaseMenuItem {
  id: string;
  name: string;
  code?: string;
  depth: number;
  order: number;
  isActive: boolean;
  icon?: string;
  parentId: string;
  parentName: string;
  requiredPermission?: string;
  hasNotification?: boolean;
}

interface NavigableMenuItem extends BaseMenuItem {
  path: string;
  children?: never;
}

interface ParentMenuItem extends BaseMenuItem {
  path?: string;
  children: MenuItem[];
}

export type MenuItem = NavigableMenuItem | ParentMenuItem;

interface MenuState {
  items: MenuItem[];
  selectedItem: MenuItem | null;
  expandedItems: string[];
  loading: boolean;
  error: string | null;
}

const initialState: MenuState = {
  items: [],
  selectedItem: null,
  expandedItems: [],
  loading: false,
  error: null,
};

const getAllIds = (items: MenuItem[]): string[] => {
  return items.reduce((acc: string[], item) => {
    acc.push(item.id);
    if ("children" in item && item.children) {
      acc.push(...getAllIds(item.children));
    }
    return acc;
  }, []);
};

const expandLevels = (items: MenuItem[], level: number = 0): string[] => {
  return items.reduce((acc: string[], item) => {
    if (level < 2) {
      acc.push(item.id);
    }
    if ("children" in item && item.children && level < 2) {
      acc.push(...expandLevels(item.children, level + 1));
    }
    return acc;
  }, []);
};

const isParentMenuItem = (item: MenuItem): item is ParentMenuItem => {
  return "children" in item && item.children !== undefined;
};

const isNavigableMenuItem = (item: MenuItem): item is NavigableMenuItem => {
  return "path" in item && item.path !== undefined && !("children" in item);
};

export const fetchMenus = createAsyncThunk(
  "menu/fetchMenus",
  async (menuId: string, { rejectWithValue }) => {
    try {
      const result = await menuApiService.getMenuHierarchy(menuId);

      if (result.success && Array.isArray(result.data)) {
        return result.data as MenuItem[];
      }

      throw new Error("No hierarchy data found in response");
    } catch (error) {
      console.error("❌ fetchMenus error:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  }
);

export const createMenuItem = createAsyncThunk(
  "menu/createMenuItem",
  async (data: unknown, { rejectWithValue }) => {
    try {
      const result = await menuApiService.createMenuItem(data);

      if (result.success) {
        return result.data as MenuItem;
      }

      throw new Error(result.message || "Failed to create menu item");
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  }
);

export const updateMenuItem = createAsyncThunk(
  "menu/updateMenuItem",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const result = await menuApiService.updateMenuItem(id, data);

      if (result.success) {
        return result.data as MenuItem;
      }

      throw new Error(result.message || "Failed to update menu item");
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  }
);

export const deleteMenuItem = createAsyncThunk(
  "menu/deleteMenuItem",
  async (id: string, { rejectWithValue }) => {
    try {
      await menuApiService.deleteMenuItem(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  }
);

export const createChildMenuItem = createAsyncThunk(
  "menu/createChildMenuItem",
  async (
    { parentId, data }: { parentId: string; data: any },
    { rejectWithValue }
  ) => {
    try {
      const result = await menuApiService.createChildMenuItem(parentId, data);

      if (result.success) {
        return result.data as MenuItem & { parentId: string };
      } else {
        throw new Error(result.message || "Failed to create child menu");
      }
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  }
);

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    setSelectedItem: (state, action: PayloadAction<MenuItem | null>) => {
      state.selectedItem = action.payload;
    },
    toggleExpanded: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      if (state.expandedItems.includes(itemId)) {
        state.expandedItems = state.expandedItems.filter((id) => id !== itemId);
      } else {
        state.expandedItems.push(itemId);
      }
    },
    expandAll: (state) => {
      state.expandedItems = getAllIds(state.items);
    },
    collapseAll: (state) => {
      state.expandedItems = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    setExpandedItems: (state, action: PayloadAction<string[]>) => {
      state.expandedItems = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Menus
      .addCase(fetchMenus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenus.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.expandedItems = expandLevels(action.payload);
      })
      .addCase(fetchMenus.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch menus";
      })
      // Create Menu Item
      .addCase(createMenuItem.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(createMenuItem.rejected, (state, action) => {
        state.error =
          (action.payload as string) || "Failed to create menu item";
      })
      // Update Menu Item
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateMenuItem.rejected, (state, action) => {
        state.error =
          (action.payload as string) || "Failed to update menu item";
      })
      // Delete Menu Item
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteMenuItem.rejected, (state, action) => {
        state.error =
          (action.payload as string) || "Failed to delete menu item";
      })
      // Create Child Menu Item
      .addCase(createChildMenuItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChildMenuItem.fulfilled, (state, action) => {
        state.loading = false;

        const addChildToHierarchy = (
          items: MenuItem[],
          newItem: MenuItem,
          parentId: string
        ): MenuItem[] => {
          return items.map((item) => {
            if (item.id === parentId && isParentMenuItem(item)) {
              if (!state.expandedItems.includes(parentId)) {
                state.expandedItems.push(parentId);
              }
              return {
                ...item,
                children: [...(item.children || []), newItem],
              };
            }
            if (
              isParentMenuItem(item) &&
              item.children &&
              item.children.length > 0
            ) {
              return {
                ...item,
                children: addChildToHierarchy(item.children, newItem, parentId),
              };
            }
            return item;
          });
        };

        state.items = addChildToHierarchy(
          state.items,
          action.payload,
          action.payload.parentId
        );
      })
      .addCase(createChildMenuItem.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to create child menu";
      });
  },
});

export const {
  setSelectedItem,
  toggleExpanded,
  expandAll,
  collapseAll,
  clearError,
  setExpandedItems,
} = menuSlice.actions;

export default menuSlice.reducer;
