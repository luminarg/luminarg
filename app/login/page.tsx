import Link from "next/link";
import { loginAction } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  const error = params?.error;
  const next = params?.next || "/";

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-20 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-neutral-500">
            LUMINARG
          </p>
          <h1 className="mt-3 text-4xl font-light">Ingresar</h1>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error === "credenciales"
                ? "Email o contraseña incorrectos."
                : "No se pudo iniciar sesión. Intentá nuevamente."}
            </div>
          )}

          <div className="mb-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              o
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form action={loginAction}>
            {/* 👇 CLAVE PARA QUE NO SE PIERDA LA REDIRECCIÓN */}
            <input type="hidden" name="next" value={next} />

            <div>
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
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div className="mt-8 flex gap-4">
              <button
                type="submit"
                className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black"
              >
                Ingresar
              </button>

              <Link
                href="/signup"
                className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-white"
              >
                Crear cuenta
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}