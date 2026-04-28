import { redirect } from "next/navigation";
import Header from "@/app/components/Header";
import CheckoutClient from "./CheckoutClient";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login?next=/checkout");
  }

  return (
    <>
      <Header isLoggedIn={true} isInternal={false} />

      <main className="min-h-screen bg-[#070707] px-4 py-12 text-white sm:px-6 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <CheckoutClient />
        </div>
      </main>
    </>
  );
}