import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/data/auth";
import { getMayoristaById } from "@/data/mayoristaService";
import { getCCTransactions } from "@/data/ccService";

export const dynamic = "force-dynamic";

function money(n: number) {
  return `ARS ${Number(n).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
}

export default async function MayoristaCuentaPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "mayorista") redirect("/login");

  const [mayorista, transactions] = await Promise.all([
    getMayoristaById(profile.id),
    getCCTransactions(profile.id),
  ]);

  if (!mayorista) redirect("/mayorista/catalogo");

  const isCC = mayorista.payment_type === "cuenta_corriente";

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Mi cuenta</p>
        <h1 className="mt-2 text-3xl font-light">{mayorista.company_name}</h1>
        <p className="mt-1 text-sm text-neutral-500">{mayorista.email}</p>
      </header>

      {/* Datos de la empresa */}
      <section className="border border-white/[0.07] bg-white/[0.02] p-6">
        <h2 className="mb-4 text-sm uppercase tracking-[0.2em] text-neutral-500">Datos de la empresa</h2>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          {[
            { label: "Razón social", value: mayorista.company_name },
            { label: "CUIT", value: mayorista.cuit },
            { label: "Contacto", value: mayorista.contact_name },
            { label: "Teléfono", value: mayorista.phone },
            { label: "Dirección", value: mayorista.address },
            { label: "Ciudad", value: mayorista.city && mayorista.province ? `${mayorista.city}, ${mayorista.province}` : mayorista.city },
          ].map(({ label, value }) => value ? (
            <p key={label} className="text-neutral-500">
              {label}: <span className="text-white">{value}</span>
            </p>
          ) : null)}
          <p className="text-neutral-500">
            Condición: <span className="text-white">{isCC ? "Cuenta corriente" : "Contado"}</span>
          </p>
        </div>
        <p className="mt-4 text-xs text-neutral-600">
          Para modificar tus datos, contactá a Luminarg.
        </p>
      </section>

      {/* Cuenta corriente */}
      {isCC ? (
        <section className="space-y-4">
          <div className={`border p-6 ${mayorista.current_balance > 0 ? "border-[#d6b36a]/30 bg-[#d6b36a]/[0.04]" : "border-green-800/30 bg-green-900/[0.04]"}`}>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Saldo actual</p>
            <p className={`mt-2 text-4xl font-light ${mayorista.current_balance > 0 ? "text-[#d6b36a]" : "text-green-400"}`}>
              {money(Math.abs(mayorista.current_balance))}
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              {mayorista.current_balance > 0
                ? "Tenés un saldo pendiente de pago."
                : mayorista.current_balance < 0
                  ? "Tenés saldo a favor."
                  : "Tu cuenta está al día."}
            </p>
            {mayorista.credit_limit > 0 && (
              <p className="mt-1 text-xs text-neutral-600">
                Límite de crédito disponible: {money(mayorista.credit_limit)}
              </p>
            )}
          </div>

          {/* Movimientos */}
          {transactions.length > 0 && (
            <div className="border border-white/[0.07] bg-white/[0.02]">
              <div className="border-b border-white/[0.07] px-5 py-4">
                <h2 className="text-sm uppercase tracking-[0.2em] text-neutral-500">Movimientos</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-white/[0.07] text-xs text-neutral-500">
                    <tr>
                      <th className="px-5 py-3 text-left">Fecha</th>
                      <th className="px-5 py-3 text-left">Tipo</th>
                      <th className="px-5 py-3 text-left">Descripción</th>
                      <th className="px-5 py-3 text-right">Importe</th>
                      <th className="px-5 py-3 text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-white/[0.04]">
                        <td className="px-5 py-3 text-neutral-500">
                          {new Date(tx.created_at).toLocaleDateString("es-AR", { dateStyle: "short" })}
                        </td>
                        <td className="px-5 py-3">
                          <span className={tx.type === "pago" ? "badge badge-green" : tx.type === "cargo" ? "badge badge-gold" : "badge badge-neutral"}>
                            {tx.type === "cargo" ? "Cargo" : tx.type === "pago" ? "Pago" : "Ajuste"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-neutral-400">{tx.description ?? "—"}</td>
                        <td className={`px-5 py-3 text-right ${tx.type === "pago" ? "text-green-400" : "text-[#d6b36a]"}`}>
                          {tx.type === "pago" ? "-" : "+"}{money(tx.amount)}
                        </td>
                        <td className="px-5 py-3 text-right text-white">
                          {tx.balance_after != null ? money(tx.balance_after) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      ) : (
        <div className="border border-white/[0.07] bg-white/[0.02] p-6 text-sm text-neutral-500">
          Tu modalidad de pago es <span className="text-white">contado</span>. El pago se coordina con Luminarg al confirmar cada pedido.
        </div>
      )}

      <div className="pt-2">
        <Link href="/mayorista/catalogo" className="text-xs text-neutral-600 transition hover:text-neutral-400">
          ← Volver al catálogo
        </Link>
      </div>
    </div>
  );
}
