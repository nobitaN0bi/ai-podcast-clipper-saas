"use server";

import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import NavHeader from "~/components/nav-header";
import { Toaster } from "~/components/ui/sonner";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { DashboardSidebar } from "~/components/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  let user;
  try {
    user = await db.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { credits: true, email: true },
    });
  } catch (error) {
    // If user not found (e.g. offline dev mode or DB reset), provide mock data
    // This allows the dashboard to render even if the DB is desynchronized
    console.warn("User not found in DB, using mock data for dashboard");
    user = {
      credits: 0,
      email: session.user.email ?? "offline@demo.user"
    };
  }

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-zinc-900 selection:text-white">
      <NavHeader credits={user.credits} email={user.email} />
      {/* Offline/Demo Banner */}
      {process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true' && (
        <div className="bg-amber-100 text-amber-800 px-4 py-1 text-xs font-mono text-center border-b border-amber-200">
          ⚠️ OFFLINE MODE ACTIVE - USING LOCAL STORAGE ONLY
        </div>
      )}

      <div className="flex flex-1 pt-16">
        {/* Sidebar (Fixed position handled in component) */}
        <DashboardSidebar />

        {/* Main Content Area - Added padding-left to account for fixed sidebar */}
        <main className="flex-1 overflow-auto bg-background md:pl-64">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto p-8">
            {children}
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  );
}
