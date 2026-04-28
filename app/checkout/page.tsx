import Header from "@/app/components/Header";
import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  return (
    <>
      <Header isLoggedIn={false} isInternal={false} />

      <main className="min-h-screen bg-[#070707] px-4 py-12 text-white sm:px-6 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <CheckoutClient />
        </div>
      </main>
    </>
  );
}