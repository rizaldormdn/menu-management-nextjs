// components/CreateChildMenuForm.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

interface CreateChildMenuFormProps {
  onSubmit: (data: {
    name: string;
    code: string;
    path: string;
    icon: string;
    isActive: boolean;
    order: number;
  }) => void;
  onCancel: () => void;
  loading?: boolean;
  parentItem: {
    name: string;
    path?: string;
    childrenCount: number;
  };
}

export function CreateChildMenuForm({
  onSubmit,
  onCancel,
  loading = false,
  parentItem,
}: CreateChildMenuFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    path: "",
    icon: "🔧",
    isActive: true,
    order: parentItem.childrenCount,
  });

  // Auto-generate code dan path ketika nama berubah
  useEffect(() => {
    if (formData.name.trim()) {
      const generatedCode = generateCodeFromName(formData.name);
      const generatedPath = generatePathFromName(formData.name);

      setFormData((prev) => ({
        ...prev,
        code: generatedCode,
        path: parentItem.path
          ? `${parentItem.path}/${generatedPath}`
          : `/${generatedPath}`,
      }));
    } else {
      // Reset code dan path jika name kosong
      setFormData((prev) => ({
        ...prev,
        code: "",
        path: "",
      }));
    }
  }, [formData.name, parentItem.path]);

  const generateCodeFromName = (name: string): string => {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
  };

  const generatePathFromName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
    }));
  };

  const handleOrderChange = (value: string) => {
    // Pastikan selalu number, default ke 0 jika kosong atau invalid
    const orderValue = value === "" ? 0 : parseInt(value) || 0;
    setFormData((prev) => ({
      ...prev,
      order: orderValue,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleNameChange(e.target.value)
            }
            placeholder="Enter menu name"
            required
            autoFocus
          />
        </div>

        {/* Code - DISABLED */}
        <div className="space-y-2">
          <Label htmlFor="code">Code *</Label>
          <Input
            id="code"
            value={formData.code}
            disabled
            className="bg-gray-100 cursor-not-allowed"
            placeholder="Auto-generated from name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Path - DISABLED */}
        <div className="space-y-2">
          <Label htmlFor="path">Path *</Label>
          <Input
            id="path"
            value={formData.path}
            disabled
            className="bg-gray-100 cursor-not-allowed"
            placeholder="Auto-generated from name"
          />
        </div>

        {/* Icon */}
        <div className="space-y-2">
          <Label htmlFor="icon">Icon</Label>
          <Input
            id="icon"
            value={formData.icon}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleOrderChange(e.target.value)
            }
            min="0"
          />
        </div>

        {/* Active Status */}
        <div className="space-y-2">
          <Label htmlFor="isActive">Status</Label>
          <div className="flex items-center space-x-2 mt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleChange("isActive", e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="isActive" className="text-sm font-normal">
              Active
            </Label>
          </div>
        </div>
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
          disabled={
            loading ||
            !formData.name.trim() ||
            !formData.code.trim() ||
            !formData.path.trim()
          }
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? "Creating..." : "Create Child Menu"}
        </Button>
      </div>
    </form>
  );
}
