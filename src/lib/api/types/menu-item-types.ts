export interface MenuItemResponseDto {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  menuId: string;
  depth: number;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  requiredPermission?: string;
}

export interface MenuItemHierarchyDto extends MenuItemResponseDto {
  children: MenuItemHierarchyDto[];
}

export interface CreateMenuItemDto {
  name: string;
  code: string;
  parentId?: string;
  menuId: string;
  order?: number;
  isActive?: boolean;
  requiredPermission?: string;
}

export interface UpdateMenuItemDto {
  name?: string;
  code?: string;
  parentId?: string;
  menuId?: string;
  order?: number;
  isActive?: boolean;
  requiredPermission?: string;
}
