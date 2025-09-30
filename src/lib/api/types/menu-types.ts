export interface MenuResponseDto {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuDto {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateMenuDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}
