import CartClient from "./CartClient";
import { getCurrentProfile, getCurrentUser } from "@/data/auth";
import { isInternalUser } from "@/data/roles";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const user = await getCurrentUser();
  const profile = await getCurrentProfile();

  const isLoggedIn = Boolean(user);
  const isInternal = Boolean(profile && isInternalUser(profile.role));

  return (
    <main className="min-h-screen bg-[#070707] text-white">
      

      <section className="px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-5xl">
          <CartClient />
        </div>
      </section>
    </main>
  );
}