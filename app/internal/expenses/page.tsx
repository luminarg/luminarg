import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { getExpenses } from "@/data/expenseService";
import {
  createExpenseAction,
  deleteExpenseAction,
  toggleExpensePaidAction,
} from "./actions";

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

function money(value: number) {
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function ExpensesPage() {
  const profile = await getCurrentProfile();

  if (!profile || !isInternalUser(profile.role)) {
    redirect("/login");
  }

  const expenses = await getExpenses();

  return (
    <main className="min-h-screen overflow-x-hidden px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-6xl space-y-10">
        <header>
          <p className="text-sm uppercase tracking-[0.28em] text-neutral-500">
            Finanzas
          </p>
          <h1 className="mt-3 text-4xl font-light">Gastos</h1>
          <p className="mt-3 text-neutral-400">
            Registro interno de compras, pagos y movimientos financieros.
          </p>
        </header>

        <form
          action={createExpenseAction}
          className="border border-white/10 bg-white/[0.03] p-5 sm:p-8"
        >
          <h2 className="mb-6 text-xl font-light">Nuevo gasto</h2>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Fecha">
              <input name="expenseDate" type="date" className="input-dark" />
            </Field>

            <Field label="Descripción">
              <input
                name="description"
                required
                placeholder="Ej: Compra de mercadería"
                className="input-dark"
              />
            </Field>

            <Field label="Importe">
              <input
                name="amount"
                type="number"
                required
                placeholder="0"
                className="input-dark"
              />
            </Field>

            <Field label="Moneda">
              <select name="currency" defaultValue="ARS" className="input-dark">
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
                <option value="CNY">CNY</option>
              </select>
            </Field>

            <Field label="Tipo">
              <select name="type" defaultValue="general" className="input-dark">
                {expenseTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Categoría">
              <select name="category" defaultValue="otros" className="input-dark">
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Pagado por">
              <input name="paidBy" className="input-dark" />
            </Field>

            <Field label="Medio de pago">
              <input name="paymentMethod" className="input-dark" />
            </Field>

            <Field label="Proveedor">
              <input name="supplier" className="input-dark" />
            </Field>

            <Field label="Factura / comprobante">
              <input name="invoiceNumber" className="input-dark" />
            </Field>
          </div>

          <div className="mt-5">
            <Field label="Notas">
              <textarea name="notes" className="input-dark min-h-[100px]" />
            </Field>
          </div>

          <label className="mt-5 flex items-center gap-3 text-sm text-neutral-300">
            <input type="checkbox" name="isPaid" />
            Este gasto ya está pagado
          </label>

          <button
            type="submit"
            className="mt-7 bg-white px-6 py-3 text-sm font-medium text-black"
          >
            Crear gasto
          </button>
        </form>

        <section className="space-y-4">
          <h2 className="text-xl font-light">Listado de gastos</h2>

          {expenses.length === 0 ? (
            <div className="border border-white/10 bg-white/[0.03] p-8 text-neutral-400">
              No hay gastos cargados.
            </div>
          ) : (
            <div className="grid gap-4">
              {expenses.map((expense) => (
                <article
                  key={expense.id}
                  className="border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 space-y-3">
                      <div>
                        <p className="text-lg font-medium">
                          {expense.description}
                        </p>
                        <p className="mt-1 text-sm text-neutral-500">
                          {expense.expense_date || "Sin fecha"} ·{" "}
                          {expense.type} · {expense.category}
                        </p>
                      </div>

                      <div className="grid gap-2 text-sm text-neutral-400 sm:grid-cols-2 lg:grid-cols-3">
                        <p>
                          Importe:{" "}
                          <span className="text-white">
                            {expense.currency} {money(Number(expense.amount))}
                          </span>
                        </p>
                        <p>Pagado por: {expense.paid_by || "-"}</p>
                        <p>Medio: {expense.payment_method || "-"}</p>
                        <p>Proveedor: {expense.supplier || "-"}</p>
                        <p>Factura: {expense.invoice_number || "-"}</p>
                        <p>
                          Estado:{" "}
                          <span
                            className={
                              expense.is_paid
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {expense.is_paid ? "Pagado" : "Pendiente"}
                          </span>
                        </p>
                      </div>

                      {expense.notes && (
                        <p className="text-sm text-neutral-500">
                          Notas: {expense.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Link
                        href={`/internal/expenses/${expense.id}`}
                        className="border border-white/10 px-3 py-2 text-xs text-neutral-300 hover:border-white/30"
                      >
                        Editar
                      </Link>

                      <form
                        action={toggleExpensePaidAction.bind(
                          null,
                          expense.id,
                          expense.is_paid
                        )}
                      >
                        <button
                          type="submit"
                          className={`border px-3 py-2 text-xs ${
                            expense.is_paid
                              ? "border-yellow-600 text-yellow-300"
                              : "border-green-600 text-green-300"
                          }`}
                        >
                          {expense.is_paid ? "Marcar impago" : "Marcar pagado"}
                        </button>
                      </form>

                      <form action={deleteExpenseAction.bind(null, expense.id)}>
                        <button
                          type="submit"
                          className="border border-red-700 px-3 py-2 text-xs text-red-300"
                        >
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-neutral-400">{label}</span>
      {children}
    </label>
  );
}