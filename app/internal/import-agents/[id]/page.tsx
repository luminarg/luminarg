import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { getImportAgentById } from "@/data/importAgentService";
import { updateImportAgentAction, deleteImportAgentAction } from "./actions";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditImportAgentPage({ params }: Props) {
  const profile = await getCurrentProfile();
  if (!profile || !isInternalUser(profile.role)) redirect("/login");

  const { id } = await params;
  const agent = await getImportAgentById(Number(id));
  if (!agent) notFound();

  return (
    <main className="space-y-8 px-1 py-8 text-white">
      <header>
        <Link
          href="/internal/import-agents"
          className="text-xs text-neutral-600 transition hover:text-neutral-400"
        >
          ← Volver a agentes
        </Link>
        <h1 className="mt-2 text-2xl font-light">{agent.name}</h1>
      </header>

      <form
        action={updateImportAgentAction.bind(null, agent.id)}
        className="border border-white/[0.08] bg-white/[0.02] p-6"
      >
        <h2 className="mb-5 text-base font-medium text-neutral-200">
          Editar agente
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Nombre / Razón social *">
            <input name="name" required defaultValue={agent.name} className="input-dark" />
          </Field>

          <Field label="Empresa">
            <input name="company" defaultValue={agent.company ?? ""} className="input-dark" />
          </Field>

          <Field label="Comisión (%)">
            <input
              name="commissionRate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              defaultValue={agent.commission_rate ?? ""}
              className="input-dark"
            />
          </Field>

          <Field label="Contacto">
            <input name="contactName" defaultValue={agent.contact_name ?? ""} className="input-dark" />
          </Field>

          <Field label="Email">
            <input name="contactEmail" type="email" defaultValue={agent.contact_email ?? ""} className="input-dark" />
          </Field>

          <Field label="Teléfono / WhatsApp">
            <input name="contactPhone" defaultValue={agent.contact_phone ?? ""} className="input-dark" />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Notas internas">
            <textarea name="notes" defaultValue={agent.notes ?? ""} className="input-dark" />
          </Field>
        </div>

        <label className="mt-4 flex items-center gap-3 text-sm text-neutral-400">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={agent.is_active}
            className="accent-[#d6b36a]"
          />
          Agente activo
        </label>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            className="bg-white px-6 py-2.5 text-sm font-medium text-black transition hover:bg-[#d6b36a]"
          >
            Guardar cambios
          </button>
          <Link
            href="/internal/import-agents"
            className="border border-white/10 px-6 py-2.5 text-sm text-neutral-400 transition hover:text-white"
          >
            Cancelar
          </Link>
        </div>
      </form>

      <div className="border border-red-900/40 bg-red-950/20 p-5">
        <p className="mb-3 text-sm font-medium text-red-300">Zona de peligro</p>
        <p className="mb-4 text-xs text-neutral-500">
          Eliminar el agente es permanente.
        </p>
        <form action={deleteImportAgentAction.bind(null, agent.id)}>
          <button
            type="submit"
            className="border border-red-700 px-5 py-2 text-sm text-red-400 transition hover:bg-red-900/30"
          >
            Eliminar agente
          </button>
        </form>
      </div>
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
