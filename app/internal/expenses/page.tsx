import Link from "next/link";
import { InternalHeader } from "@/app/components/internal/InternalHeader";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import {
  calculateExpenseTotals,
  getExpenses,
} from "@/data/expenseService";
import { createExpenseAction, deleteExpenseAction } from "./actions";

export const dynamic = "force-dynamic";

const expenseTypes = [
  { value: "general", label: "Gasto general" },
  { value: "partner_contribution", label: "Aporte / gasto de socio" },
  { value: "purchase", label: "Compra" },
  { value: "installer_expense", label: "Viático instalador" },
  { value: "tax", label: "Impuesto" },
  { value: "shipping", label: "Flete / envío" },
  { value: "customs", label: "Aduana" },
];

const categories = [
  "estructura",
  "mercaderia",
  "viaticos",
  "marketing",
  "sistemas",
  "impuestos",
  "servicios",
  "otros",
];

type InternalExpensesPageProps = {
  searchParams: Promise<{
    type?: string;
    category?: string;
    currency?: string;
    paidBy?: string;
  }>;
};

export default async function InternalExpensesPage({
  searchParams,
}: InternalExpensesPageProps) {
  const profile = await getCurrentProfile();

  if (!profile || !isInternalUser(profile.role)) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-light">Acceso restringido</h1>
          <p className="mt-4 text-neutral-400">
            Esta sección está disponible solo para usuarios internos.
          </p>
          <Link href="/" className="mt-6 inline-block text-[#d6b36a]">
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  const filters = await searchParams;

  const expenses = await getExpenses({
    type: filters.type,
    category: filters.category,
    currency: filters.currency,
    paidBy: filters.paidBy,
  });

  const totals = calculateExpenseTotals(expenses);
  const totalARS = totals.totalByCurrency.ARS || 0;

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl space-y-10">
        <InternalHeader
          title="Gastos y compras"
          description="Registro interno de compras, gastos, aportes de socios, facturas y viáticos."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-neutral-500">Total ARS registrado</p>
            <p className="mt-2 text-3xl font-light">
              ${totalARS.toLocaleString("es-AR")}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-neutral-500">
              Cantidad de movimientos
            </p>
            <p className="mt-2 text-3xl font-light">{expenses.length}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-neutral-500">Módulo</p>
            <p className="mt-2 text-3xl font-light">Finanzas</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="text-sm text-neutral-500">Totales por moneda</h3>

            <div className="mt-4 space-y-2 text-sm">
              {Object.entries(totals.totalByCurrency).map(
                ([currency, amount]) => (
                  <div
                    key={currency}
                    className="flex justify-between border-b border-white/10 pb-2 text-neutral-300"
                  >
                    <span>{currency}</span>
                    <span>{amount.toLocaleString("es-AR")}</span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="text-sm text-neutral-500">Totales por tipo</h3>

            <div className="mt-4 space-y-2 text-sm">
              {Object.entries(totals.totalByType).map(([type, amount]) => (
                <div
                  key={type}
                  className="flex justify-between border-b border-white/10 pb-2 text-neutral-300"
                >
                  <span>{type}</span>
                  <span>{amount.toLocaleString("es-AR")}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="text-sm text-neutral-500">
              Totales por categoría
            </h3>

            <div className="mt-4 space-y-2 text-sm">
              {Object.entries(totals.totalByCategory).map(
                ([category, amount]) => (
                  <div
                    key={category}
                    className="flex justify-between border-b border-white/10 pb-2 text-neutral-300"
                  >
                    <span>{category}</span>
                    <span>{amount.toLocaleString("es-AR")}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="text-sm text-neutral-500">Totales por pagado por</h3>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {Object.entries(totals.totalByPaidBy).map(([paidBy, amount]) => (
              <div
                key={paidBy}
                className="rounded-xl border border-white/10 bg-black p-4"
              >
                <p className="text-sm text-neutral-500">{paidBy}</p>
                <p className="mt-2 text-xl font-light">
                  ${amount.toLocaleString("es-AR")}
                </p>
              </div>
            ))}
          </div>
        </div>

        <form
          action="/internal/expenses"
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
        >
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Tipo
              </label>
              <select
                name="type"
                defaultValue={filters.type || "all"}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              >
                <option value="all">Todos</option>
                {expenseTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Categoría
              </label>
              <select
                name="category"
                defaultValue={filters.category || "all"}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              >
                <option value="all">Todas</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Moneda
              </label>
              <select
                name="currency"
                defaultValue={filters.currency || "all"}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              >
                <option value="all">Todas</option>
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
                <option value="CNY">CNY</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Pagado por
              </label>
              <input
                name="paidBy"
                defaultValue={filters.paidBy || ""}
                placeholder="Socio / instalador"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div className="flex items-end gap-3">
              <button
                type="submit"
                className="rounded-full bg-white px-5 py-3 text-sm font-medium text-black"
              >
                Filtrar
              </button>

              <Link
                href="/internal/expenses"
                className="rounded-full border border-white/10 px-5 py-3 text-sm text-white"
              >
                Limpiar
              </Link>
            </div>
          </div>
        </form>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <h2 className="text-2xl font-light">Nuevo movimiento</h2>

          <form action={createExpenseAction} className="mt-6 grid gap-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm text-neutral-400">
                  Fecha
                </label>
                <input
                  name="expenseDate"
                  type="date"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-neutral-400">
                  Tipo
                </label>
                <select
                  name="type"
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
                >
                  {expenseTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-neutral-400">
                  Categoría
                </label>
                <select
                  name="category"
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm text-neutral-400">
                  Importe
                </label>
                <input
                  name="amount"
                  type="number"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-neutral-400">
                  Moneda
                </label>
                <select
                  name="currency"
                  defaultValue="ARS"
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
                >
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                  <option value="CNY">CNY</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-neutral-400">
                  Pagado por
                </label>
                <input
                  name="paidBy"
                  placeholder="Socio / instalador / empresa"
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Descripción
              </label>
              <input
                name="description"
                required
                placeholder="Ej: Compra de perfiles, viático instalador, hosting..."
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm text-neutral-400">
                  Medio de pago
                </label>
                <input
                  name="paymentMethod"
                  placeholder="Efectivo / transferencia / tarjeta"
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-neutral-400">
                  Proveedor
                </label>
                <input
                  name="supplier"
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-neutral-400">
                  Nº factura / comprobante
                </label>
                <input
                  name="invoiceNumber"
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Notas
              </label>
              <textarea
                name="notes"
                className="min-h-[90px] w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <button
              type="submit"
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black"
            >
              Guardar movimiento
            </button>
          </form>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <div className="min-w-[1200px]">
            <div className="grid grid-cols-9 border-b border-white/10 bg-white/[0.03] px-6 py-4 text-sm text-neutral-400">
              <div>Fecha</div>
              <div>Tipo</div>
              <div>Categoría</div>
              <div>Descripción</div>
              <div>Importe</div>
              <div>Pagado por</div>
              <div>Proveedor</div>
              <div>Factura</div>
              <div>Acción</div>
            </div>

            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="grid grid-cols-9 items-center border-b border-white/10 px-6 py-4 text-sm last:border-b-0"
              >
                <div className="text-neutral-300">
                  {expense.expenseDate}
                </div>
                <div className="text-neutral-300">{expense.type}</div>
                <div className="text-neutral-300">{expense.category}</div>
                <div className="text-white">{expense.description}</div>
                <div className="text-neutral-300">
                  {expense.currency}{" "}
                  {expense.amount.toLocaleString("es-AR")}
                </div>
                <div className="text-neutral-300">
                  {expense.paidBy || "-"}
                </div>
                <div className="text-neutral-300">
                  {expense.supplier || "-"}
                </div>
                <div className="text-neutral-300">
                  {expense.invoiceNumber || "-"}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/internal/expenses/${expense.id}`}
                    className="inline-block rounded-full border border-white/10 px-4 py-2 text-xs text-neutral-300 hover:border-white/30"
                  >
                    Editar
                  </Link>

                  <form action={deleteExpenseAction}>
                    <input type="hidden" name="id" value={expense.id} />
                    <button
                      type="submit"
                      className="inline-block rounded-full border border-red-500/30 px-4 py-2 text-xs text-red-200 hover:border-red-400/60"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
              </div>
            ))}

            {expenses.length === 0 && (
              <div className="px-6 py-10 text-sm text-neutral-500">
                Todavía no hay movimientos cargados.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}