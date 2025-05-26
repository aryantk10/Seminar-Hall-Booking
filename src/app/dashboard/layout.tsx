
"use client";
import Header from "@/components/shared/Header";
import SidebarNav from "@/components/dashboard/SidebarNav";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, Suspense } from "react"; // Added Suspense
import { Loader2 } from "lucide-react";
import { SidebarInset } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login/faculty"); // Or a generic login page
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // This helps prevent rendering the layout briefly if redirecting
    return null; 
  }

  return (
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <div className="flex flex-1">
          <SidebarNav />
          <SidebarInset className="flex-1">
            <main className="p-4 md:p-6 lg:p-8">
             <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2">Loading page...</span></div>}>
               {children}
             </Suspense>
            </main>
          </SidebarInset>
        </div>
      </div>
  );
}
