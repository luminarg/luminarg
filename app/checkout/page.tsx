import Header from "@/app/components/Header";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <Header />

      <section className="px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <CheckoutClient />
        </div>
      </section>
    </main>
  );
}