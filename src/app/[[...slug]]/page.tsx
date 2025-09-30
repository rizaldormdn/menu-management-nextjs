/* eslint-disable @typescript-eslint/no-explicit-any */
// app/[[...slug]]/page.tsx
import { MenusPage } from "@/component/menus/menuPage";
import { notFound } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function getMenuData(path: string) {
  try {
    const res = await fetch(
      `${API_URL}/menu-items/path/${encodeURIComponent(path)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export const COMPONENT_REGISTRY: Record<string, React.ComponentType> = {
  MENU_MANAGEMENT: MenusPage,
  DASHBOARD: () => <div>Dashboard Component</div>,
};

export function DynamicComponent({ menuItem }: { menuItem: any }) {

  const Component = COMPONENT_REGISTRY[menuItem.code];
  return <Component />;
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const path = slug ? slug.join("/") : "";

  const res = await fetch(`${API_URL}/menu-items/path/${path}`);
  const data = await res.json();

  if (!data.success) notFound();

  return <DynamicComponent menuItem={data.data} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const path = slug ? `/${slug.join("/")}` : "/";

  const menuItem = await getMenuData(path);
  return { title: menuItem?.name || "Not Found" };
}
