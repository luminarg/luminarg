import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { updateExpenseAction } from "./actions";

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

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ExpenseEditPage({ params }: PageProps) {
  const profile = await getCurrentProfile();

  if (!profile || !isInternalUser(profile.role)) {
    redirect("/login");
  }

  const { id } = await params;
  const expenseId = Number(id);

  const { data: expense, error } = await supabaseAdmin
    .from("expenses")
    .select("*")
    .eq("id", expenseId)
    .single();

  if (error || !expense) {
    notFound();
  }

  const saveAction = updateExpenseAction.bind(null, expenseId);

  return (
    <main className="min-h-screen px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-neutral-500">
              Finanzas
            </p>
            <h1 className="mt-3 text-4xl font-light">Editar gasto</h1>
          </div>

          <Link
            href="/internal/expenses"
            className="w-fit border border-white/10 px-4 py-2 text-sm text-neutral-300 hover:border-white/30"
          >
            Volver a gastos
          </Link>
        </div>

        <form
          action={saveAction}
          className="border border-white/10 bg-white/[0.03] p-6 sm:p-8"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Fecha">
              <input
                name="expenseDate"
                type="date"
                defaultValue={expense.expense_date || ""}
                className="input-dark"
              />
            </Field>

            <Field label="Tipo">
              <select name="type" defaultValue={expense.type} className="input-dark">
                {expenseTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Categoría">
              <select
                name="category"
                defaultValue={expense.category}
                className="input-dark"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Importe">
              <input
                name="amount"
                type="number"
                defaultValue={expense.amount}
                className="input-dark"
              />
            </Field>

            <Field label="Moneda">
              <select
                name="currency"
                defaultValue={expense.currency || "ARS"}
                className="input-dark"
              >
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
                <option value="CNY">CNY</option>
              </select>
            </Field>

            <Field label="Pagado por">
              <input
                name="paidBy"
                defaultValue={expense.paid_by || ""}
                className="input-dark"
              />
            </Field>

            <Field label="Medio de pago">
              <input
                name="paymentMethod"
                defaultValue={expense.payment_method || ""}
                className="input-dark"
              />
            </Field>

            <Field label="Proveedor">
              <input
                name="supplier"
                defaultValue={expense.supplier || ""}
                className="input-dark"
              />
            </Field>

            <Field label="Factura / comprobante">
              <input
                name="invoiceNumber"
                defaultValue={expense.invoice_number || ""}
                className="input-dark"
              />
            </Field>
          </div>

          <div className="mt-6">
            <Field label="Descripción">
              <textarea
                name="description"
                defaultValue={expense.description || ""}
                className="input-dark min-h-[100px]"
              />
            </Field>
          </div>

          <div className="mt-6">
            <Field label="Notas">
              <textarea
                name="notes"
                defaultValue={expense.notes || ""}
                className="input-dark min-h-[120px]"
              />
            </Field>
          </div>

          <label className="mt-6 flex items-center gap-3 text-sm text-neutral-300">
            <input
              type="checkbox"
              name="isPaid"
              defaultChecked={Boolean(expense.is_paid)}
            />
            Gasto pagado
          </label>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="bg-white px-6 py-3 text-sm font-medium text-black"
            >
              Guardar cambios
            </button>

            <Link
              href="/internal/expenses"
              className="border border-white/10 px-6 py-3 text-center text-sm text-white"
            >
              Cancelar
            </Link>
          </div>
        </form>
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