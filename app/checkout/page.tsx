import { redirect } from "next/navigation";
import Header from "@/app/components/Header";
import CheckoutClient from "./CheckoutClient";
import { getCurrentProfile, getCurrentUser } from "@/data/auth";
import { isInternalUser } from "@/data/roles";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/checkout");
  }

  const profile = await getCurrentProfile();
  const isInternal = Boolean(profile && isInternalUser(profile.role));

  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <Header isLoggedIn={true} isInternal={isInternal} />

      <section className="px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <CheckoutClient userId={user.id} />
        </div>
      </section>
    </main>
  );
}