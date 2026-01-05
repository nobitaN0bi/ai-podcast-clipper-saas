

import { redirect } from "next/navigation";
import { SignupForm } from "~/components/signup-form";
import { auth } from "~/server/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Start Free",
  description: "Create your free ClipFlow account. Turn long podcasts into viral short clips with AI.",
};

export default async function Page() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background relative overflow-hidden">
      {/* Background Gradients */}

      {/* Background Gradients Removed for YC Minimal */}


      <div className="w-full max-w-sm relative z-10">
        <SignupForm />
      </div>
    </div>
  );
}
