import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { getMayoristaProfiles } from "@/data/mayoristaService";
import { approveMayoristaAction } from "./actions";

export const dynamic = "force-dynamic";

function money(n: number) {
  return `ARS ${Number(n).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
}

export default async function MayoristasPage() {
  const profile = await getCurrentProfile();
  if (!profile || !isInternalUser(profile.role)) redirect("/login");

  const all = await getMayoristaProfiles();
  const pending = all.filter((m) => !m.is_approved);
  const approved = all.filter((m) => m.is_approved);

  return (
    <main className="space-y-10 px-1 py-8 text-white">

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Comercial</p>
          <h1 className="mt-3 text-3xl font-light">Mayoristas</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Gestión de clientes mayoristas, condiciones y cuenta corriente.
          </p>
        </div>
        <Link
          href="/internal/mayoristas/tiers"
          className="shrink-0 border border-white/10 px-5 py-2.5 text-sm text-neutral-400 transition hover:border-white/30 hover:text-white"
        >
          ⚙ Tramos de precio
        </Link>
      </header>

      {/* Métricas */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Total mayoristas", value: all.length },
          { label: "Pendientes aprobación", value: pending.length },
          { label: "Activos", value: approved.length },
          { label: "Con cuenta corriente", value: approved.filter((m) => m.payment_type === "cuenta_corriente").length },
        ].map((m) => (
          <div key={m.label} className="border border-white/[0.07] bg-white/[0.02] px-5 py-4">
            <p className="text-xs text-neutral-500">{m.label}</p>
            <p className="mt-1 text-2xl font-light">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Pendientes de aprobación */}
      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[#d6b36a]">
            Pendientes de aprobación ({pending.length})
          </h2>
          {pending.map((m) => (
            <div
              key={m.id}
              className="flex flex-col gap-3 border border-[#d6b36a]/20 bg-[#d6b36a]/[0.03] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-light text-white">{m.company_name}</p>
                <p className="text-xs text-neutral-500">
                  {m.email} {m.cuit && `· CUIT: ${m.cuit}`} {m.city && `· ${m.city}`}
                </p>
              </div>
              <div className="flex gap-2">
                <form action={approveMayoristaAction.bind(null, m.id)}>
                  <button type="submit" className="bg-white px-4 py-2 text-xs font-medium text-black transition hover:bg-[#d6b36a]">
                    Aprobar
                  </button>
                </form>
                <Link
                  href={`/internal/mayoristas/${m.id}`}
                  className="border border-white/10 px-4 py-2 text-xs text-neutral-400 transition hover:border-white/30 hover:text-white"
                >
                  Ver detalle
                </Link>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Aprobados */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-[0.2em] text-neutral-500">
          Activos ({approved.length})
        </h2>
        {approved.length === 0 ? (
          <div className="border border-white/[0.07] p-6 text-sm text-neutral-600">
            No hay mayoristas aprobados todavía.
          </div>
        ) : (
          <div className="space-y-2">
            {approved.map((m) => (
              <Link
                key={m.id}
                href={`/internal/mayoristas/${m.id}`}
                className="flex flex-col gap-3 border border-white/[0.07] bg-white/[0.02] px-5 py-4 transition hover:border-white/15 hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-light text-white">{m.company_name}</p>
                  <p className="text-xs text-neutral-500">
                    {m.email}
                    {m.contact_name && ` · ${m.contact_name}`}
                    {m.city && ` · ${m.city}`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={m.payment_type === "cuenta_corriente" ? "badge badge-blue" : "badge badge-neutral"}>
                    {m.payment_type === "cuenta_corriente" ? "Cta. corriente" : "Contado"}
                  </span>
                  {m.payment_type === "cuenta_corriente" && (
                    <span className={m.current_balance > 0 ? "text-sm text-[#d6b36a]" : "text-sm text-green-400"}>
                      {m.current_balance > 0 ? `Debe ${money(m.current_balance)}` : "Sin deuda"}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
