import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { getImportAgents } from "@/data/importAgentService";
import { createImportAgentAction, deleteImportAgentAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ImportAgentsPage() {
  const profile = await getCurrentProfile();
  if (!profile || !isInternalUser(profile.role)) redirect("/login");

  const agents = await getImportAgents();

  return (
    <main className="space-y-10 px-1 py-8 text-white">
      <header>
        <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">
          Compras
        </p>
        <h1 className="mt-3 text-3xl font-light">Agentes de importación</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Intermediarios que gestionan el despacho y la aduana de tus importaciones.
        </p>
      </header>

      {/* ── FORMULARIO NUEVO ─────────────────────────────────────── */}
      <form
        action={createImportAgentAction}
        className="border border-white/[0.08] bg-white/[0.02] p-6"
      >
        <h2 className="mb-5 text-base font-medium text-neutral-200">
          Nuevo agente
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Nombre / Razón social *">
            <input name="name" required className="input-dark" placeholder="Ej: Agente Marítimo SRL" />
          </Field>

          <Field label="Empresa">
            <input name="company" className="input-dark" placeholder="Nombre de la empresa" />
          </Field>

          <Field label="Comisión (%)">
            <input
              name="commissionRate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              className="input-dark"
              placeholder="Ej: 3.5"
            />
          </Field>

          <Field label="Contacto">
            <input name="contactName" className="input-dark" placeholder="Nombre del contacto" />
          </Field>

          <Field label="Email">
            <input name="contactEmail" type="email" className="input-dark" placeholder="agente@ejemplo.com" />
          </Field>

          <Field label="Teléfono / WhatsApp">
            <input name="contactPhone" className="input-dark" placeholder="+54..." />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Notas internas">
            <textarea
              name="notes"
              className="input-dark"
              placeholder="Especialidad, puertos que maneja, condiciones..."
            />
          </Field>
        </div>

        <button
          type="submit"
          className="mt-5 bg-white px-6 py-2.5 text-sm font-medium text-black transition hover:bg-[#d6b36a]"
        >
          Guardar agente
        </button>
      </form>

      {/* ── LISTADO ──────────────────────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-base font-medium text-neutral-300">
          {agents.length === 0
            ? "Sin agentes"
            : `${agents.length} agente${agents.length !== 1 ? "s" : ""}`}
        </h2>

        {agents.length === 0 ? (
          <div className="border border-white/[0.07] bg-white/[0.02] p-8 text-sm text-neutral-600">
            Todavía no cargaste ningún agente.
          </div>
        ) : (
          <div className="space-y-3">
            {agents.map((a) => (
              <article
                key={a.id}
                className="flex flex-col gap-4 border border-white/[0.08] bg-white/[0.02] p-5 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-white">{a.name}</p>
                    {a.company && (
                      <span className="text-xs text-neutral-500">{a.company}</span>
                    )}
                    <span className={`badge ${a.is_active ? "badge-green" : "badge-neutral"}`}>
                      {a.is_active ? "Activo" : "Inactivo"}
                    </span>
                    {a.commission_rate != null && (
                      <span className="badge badge-gold">
                        {Number(a.commission_rate).toFixed(2)}% comisión
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500">
                    {[a.contact_name, a.contact_email, a.contact_phone]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {a.notes && (
                    <p className="text-xs text-neutral-600">{a.notes}</p>
                  )}
                </div>

                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/internal/import-agents/${a.id}`}
                    className="border border-white/10 px-3 py-1.5 text-xs text-neutral-300 transition hover:border-white/30 hover:text-white"
                  >
                    Editar
                  </Link>
                  <form action={deleteImportAgentAction.bind(null, a.id)}>
                    <button
                      type="submit"
                      className="border border-red-800/60 px-3 py-1.5 text-xs text-red-400 transition hover:border-red-600"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500">
        {label}
      </span>
      {children}
    </label>
  );
}
