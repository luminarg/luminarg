import Link from "next/link";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { getExpenseById } from "@/data/expenseService";
import { updateExpenseAction } from "./actions";
import {
  calculateExpenseTotals,
  getExpenses,
} from "@/data/expenseService";

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

type ExpenseEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ExpenseEditPage({ params }: ExpenseEditPageProps) {
  const { id } = await params;
  const expenseId = Number(id);

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

  const expense = await getExpenseById(expenseId);

  if (!expense) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-light">Gasto no encontrado</h1>

          <Link
            href="/internal/expenses"
            className="mt-6 inline-block text-[#d6b36a]"
          >
            Volver a finanzas
          </Link>
        </div>
      </main>
    );
  }

  const saveAction = updateExpenseAction.bind(null, expense.id);

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-neutral-500">
              Finanzas internas
            </p>
            <h1 className="mt-3 text-4xl font-light">Editar gasto</h1>
          </div>

          <Link
            href="/internal/expenses"
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-neutral-300 hover:border-white/30"
          >
            Volver
          </Link>
        </div>

        <form
          action={saveAction}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-8"
        >
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Fecha
              </label>
              <input
                name="expenseDate"
                type="date"
                required
                defaultValue={expense.expenseDate}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Tipo
              </label>
              <select
                name="type"
                defaultValue={expense.type}
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
                defaultValue={expense.category}
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

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Importe
              </label>
              <input
                name="amount"
                type="number"
                required
                defaultValue={expense.amount}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Moneda
              </label>
              <select
                name="currency"
                defaultValue={expense.currency}
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
                defaultValue={expense.paidBy || ""}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm text-neutral-400">
              Descripción
            </label>
            <input
              name="description"
              required
              defaultValue={expense.description}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
            />
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Medio de pago
              </label>
              <input
                name="paymentMethod"
                defaultValue={expense.paymentMethod || ""}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Proveedor
              </label>
              <input
                name="supplier"
                defaultValue={expense.supplier || ""}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Nº factura / comprobante
              </label>
              <input
                name="invoiceNumber"
                defaultValue={expense.invoiceNumber || ""}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm text-neutral-400">
              Notas
            </label>
            <textarea
              name="notes"
              defaultValue={expense.notes || ""}
              className="min-h-[120px] w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
            />
          </div>

          <div className="mt-8 flex gap-4">
            <button
              type="submit"
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black"
            >
              Guardar cambios
            </button>

            <Link
              href="/internal/expenses"
              className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-white"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}