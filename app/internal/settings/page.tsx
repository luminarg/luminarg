import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { getCompanySettings } from "@/data/companySettingsService";
import { updateCompanySettingsAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile || !isInternalUser(profile.role)) redirect("/login");

  const settings = await getCompanySettings();

  return (
    <main className="space-y-10 px-1 py-8 text-white">
      <header>
        <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">
          Compras
        </p>
        <h1 className="mt-3 text-3xl font-light">Configuración empresa</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Estos datos se usan al generar órdenes de compra. Editables en cualquier momento.
        </p>
      </header>

      <form
        action={updateCompanySettingsAction}
        className="border border-white/[0.08] bg-white/[0.02] p-6"
      >
        <h2 className="mb-5 text-base font-medium text-neutral-200">
          Datos de la empresa
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Razón social / Nombre">
            <input
              name="company_name"
              defaultValue={settings.company_name}
              className="input-dark"
              placeholder="Ej: Luminarg SA"
            />
          </Field>

          <Field label="CUIT">
            <input
              name="company_cuit"
              defaultValue={settings.company_cuit}
              className="input-dark"
              placeholder="Ej: 30-12345678-9"
            />
          </Field>

          <Field label="Dirección">
            <input
              name="company_address"
              defaultValue={settings.company_address}
              className="input-dark"
              placeholder="Calle, número, ciudad, provincia"
            />
          </Field>

          <Field label="Teléfono">
            <input
              name="company_phone"
              defaultValue={settings.company_phone}
              className="input-dark"
              placeholder="+54 351 000-0000"
            />
          </Field>

          <Field label="Email">
            <input
              name="company_email"
              type="email"
              defaultValue={settings.company_email}
              className="input-dark"
              placeholder="info@luminarg.com.ar"
            />
          </Field>

          <Field label="Sitio web">
            <input
              name="company_web"
              defaultValue={settings.company_web}
              className="input-dark"
              placeholder="www.luminarg.com.ar"
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Datos bancarios (para la OC)">
            <textarea
              name="company_bank"
              defaultValue={settings.company_bank}
              className="input-dark"
              placeholder="Banco, CBU, alias, titular..."
            />
          </Field>
        </div>

        <button
          type="submit"
          className="mt-6 bg-white px-6 py-2.5 text-sm font-medium text-black transition hover:bg-[#d6b36a]"
        >
          Guardar configuración
        </button>
      </form>

      {/* Preview de cómo queda */}
      {settings.company_name && (
        <section className="border border-white/[0.07] bg-white/[0.01] p-6">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-neutral-600">
            Así aparece en la orden de compra
          </p>
          <div className="space-y-1 text-sm">
            <p className="text-base font-medium text-white">{settings.company_name}</p>
            {settings.company_cuit && (
              <p className="text-neutral-400">CUIT: {settings.company_cuit}</p>
            )}
            {settings.company_address && (
              <p className="text-neutral-400">{settings.company_address}</p>
            )}
            {settings.company_phone && (
              <p className="text-neutral-400">{settings.company_phone}</p>
            )}
            {settings.company_email && (
              <p className="text-neutral-400">{settings.company_email}</p>
            )}
            {settings.company_web && (
              <p className="text-neutral-400">{settings.company_web}</p>
            )}
            {settings.company_bank && (
              <p className="mt-3 text-xs text-neutral-500">{settings.company_bank}</p>
            )}
          </div>
        </section>
      )}
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
