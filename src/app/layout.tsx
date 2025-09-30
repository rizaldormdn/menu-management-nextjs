import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/lib/context/sidebar-context";
import { Sidebar, SidebarToggle } from "@/component/dashboard/sidebar";
import { ReduxProvider } from "@/lib/provider/redux-provider";
import { Breadcrumb } from "@/component/breadcrumb";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Your App",
  description: "Your application description",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <SidebarProvider>
            <SidebarToggle />
            <div className="flex h-screen bg-white">
              <Sidebar />
              <main className="flex-1 overflow-auto">
                {/* Breadcrumb at top of main content */}
                <div className="sticky top-0 z-10 bg-white px-6 py-4">
                  <Breadcrumb />
                </div>
                {/* Page content */}
                <div>{children}</div>
              </main>
            </div>
          </SidebarProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
