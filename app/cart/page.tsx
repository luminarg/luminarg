import Header from "@/app/components/Header";
import CartClient from "./CartClient";
export const dynamic = "force-dynamic";

export default function CartPage() {
  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <Header />

      <section className="px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-5xl">
          <CartClient />
        </div>
      </section>
    </main>
  );
}