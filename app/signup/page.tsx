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
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-20 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-neutral-500">
            LUMINARG
          </p>
          <h1 className="mt-3 text-4xl font-light">Crear cuenta</h1>
        </div>

        <form
          action={signupAction}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-8"
        >
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              No se pudo crear la cuenta. Revisá el email y la contraseña.
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm text-neutral-400">
              Nombre
            </label>
            <input
              name="fullName"
              required
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm text-neutral-400">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm text-neutral-400">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
            />
          </div>

          <div className="mt-8 flex gap-4">
            <button
              type="submit"
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black"
            >
              Crear cuenta
            </button>

            <Link
              href="/login"
              className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-white"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}