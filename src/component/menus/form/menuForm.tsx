/* eslint-disable @typescript-eslint/no-explicit-any */
// components/menu/MenuForm.tsx
"use client";

import { Label } from "@radix-ui/react-label";
import { useState, useEffect } from "react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Switch } from "../../ui/switch";

interface MenuFormProps {
  initialData?: Partial<MenuFormData> & { id?: string };
  onSubmit: (data: MenuFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  isEdit?: boolean;
  parentItem?: {
    name: string;
    depth: number;
  };
}

export interface MenuFormData {
  name: string;
  code: string;
  path?: string;
  icon?: string;
  isActive: boolean;
  order: number;
  requiredPermission?: string;
}

export function MenuForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  isEdit = false,
  parentItem,
}: MenuFormProps) {
  const [formData, setFormData] = useState<MenuFormData>({
    name: "",
    code: "",
    path: "",
    icon: "",
    isActive: true,
    order: 0,
    requiredPermission: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof MenuFormData, string>>
  >({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        code: initialData.code || "",
        path: initialData.path || "",
        icon: initialData.icon || "",
        isActive: initialData.isActive ?? true,
        order: initialData.order || 0,
        requiredPermission: initialData.requiredPermission || "",
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof MenuFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.code.trim()) {
      newErrors.code = "Code is required";
    }

    if (formData.path && !formData.path.startsWith("/")) {
      newErrors.path = "Path must start with /";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof MenuFormData, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const generateCodeFromName = (name: string) => {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
  };

  const handleNameChange = (name: string) => {
    handleChange("name", name);

    // Auto-generate code if it's empty or matches the previous auto-generation pattern
    if (
      !formData.code ||
      formData.code === generateCodeFromName(formData.name)
    ) {
      handleChange("code", generateCodeFromName(name));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {parentItem && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Parent:</strong> {parentItem.name} (Depth:{" "}
            {parentItem.depth})
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e: { target: { value: any } }) =>
              handleNameChange(e.target.value)
            }
            placeholder="Enter menu name"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        {/* Code */}
        <div className="space-y-2">
          <Label htmlFor="code">Code *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e: { target: { value: any } }) =>
              handleChange("code", e.target.value.toUpperCase())
            }
            placeholder="e.g., DASHBOARD_VIEW"
            className={errors.code ? "border-red-500" : ""}
          />
          {errors.code && <p className="text-red-500 text-sm">{errors.code}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Path */}
        <div className="space-y-2">
          <Label htmlFor="path">Path</Label>
          <Input
            id="path"
            value={formData.path}
            onChange={(e: { target: { value: any } }) =>
              handleChange("path", e.target.value)
            }
            placeholder="/example/path"
            className={errors.path ? "border-red-500" : ""}
          />
          {errors.path && <p className="text-red-500 text-sm">{errors.path}</p>}
        </div>

        {/* Icon */}
        <div className="space-y-2">
          <Label htmlFor="icon">Icon</Label>
          <Input
            id="icon"
            value={formData.icon}
            onChange={(e: { target: { value: any } }) =>
              handleChange("icon", e.target.value)
            }
            placeholder="🔧 or icon-name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Order */}
        <div className="space-y-2">
          <Label htmlFor="order">Order</Label>
          <Input
            id="order"
            type="number"
            value={formData.order}
            onChange={(e: { target: { value: any } }) =>
              handleChange("order", parseInt(e.target.value) || 0)
            }
            min="0"
          />
        </div>

        {/* Required Permission */}
        <div className="space-y-2">
          <Label htmlFor="requiredPermission">Required Permission</Label>
          <Input
            id="requiredPermission"
            value={formData.requiredPermission}
            onChange={(e: { target: { value: any } }) =>
              handleChange("requiredPermission", e.target.value)
            }
            placeholder="e.g., menu.read"
          />
        </div>
      </div>

      {/* Active Switch */}
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked: any) => handleChange("isActive", checked)}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? "Saving..." : isEdit ? "Update Menu" : "Create Menu"}
        </Button>
      </div>
    </form>
  );
}
