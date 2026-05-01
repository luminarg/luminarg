import Image from "next/image";
import Link from "next/link";
import { signupAction } from "./actions";

type SignupPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070707] px-6 py-20">
      <div className="w-full max-w-sm">

        {/* Logo + título */}
        <div className="mb-10 flex flex-col items-center text-center">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Luminarg"
              width={160}
              height={39}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <h1 className="mt-8 text-2xl font-light tracking-tight text-white">
            Crear cuenta
          </h1>
          <p className="mt-1.5 text-xs text-neutral-600">
            Registrate para acceder al catálogo
          </p>
        </div>

        {/* Card */}
        <div className="border border-white/[0.08] bg-white/[0.02] p-7">

          {error && (
            <div className="mb-5 border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-xs text-red-300">
              No se pudo crear la cuenta. Revisá el email y la contraseña.
            </div>
          )}

          <form action={signupAction} className="space-y-5">

            <div>
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500">
                Nombre completo
              </label>
              <input
                name="fullName"
                required
                autoComplete="name"
                className="input-dark"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="input-dark"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500">
                Contraseña
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="input-dark"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                className="flex-1 bg-white py-3 text-sm font-medium text-black transition hover:bg-[#d6b36a]"
              >
                Crear cuenta
              </button>

              <Link
                href="/login"
                className="flex-1 border border-white/10 py-3 text-center text-sm text-neutral-400 transition hover:border-white/20 hover:text-white"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </form>
        </div>

      </div>
    </main>
  );
}
