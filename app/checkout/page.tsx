import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/data/auth";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="min-h-screen px-4 py-20 text-white">
        <div className="mx-auto max-w-md border border-white/[0.07] bg-white/[0.02] p-10 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Checkout</p>
          <h1 className="mt-4 text-2xl font-light">Necesitas iniciar sesion</h1>
          <p className="mt-3 text-sm text-neutral-500">
            Para finalizar tu compra necesitamos que tengas una cuenta.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/login?redirect=/checkout" className="block bg-white px-5 py-3 text-center text-sm font-medium text-black transition hover:bg-[#d6b36a]">
              Ingresar
            </Link>
            <Link href="/signup" className="block border border-white/10 px-5 py-2.5 text-center text-sm text-neutral-400 transition hover:border-white/30 hover:text-white">
              Crear cuenta
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-12 text-white sm:px-6 lg:py-16">
      <div className="mx-auto max-w-5xl">
        <CheckoutClient userEmail={user.email ?? ""} />
      </div>
    </main>
  );
}
