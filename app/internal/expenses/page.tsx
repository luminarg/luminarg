import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { getExpenses } from "@/data/expenseService";
import {
  createExpenseAction,
  toggleExpensePaidAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const profile = await getCurrentProfile();

  if (!profile || !isInternalUser(profile.role)) {
    redirect("/login");
  }

  const expenses = await getExpenses();

  return (
    <main className="min-h-screen px-4 py-10 text-white overflow-x-hidden">
      <div className="mx-auto max-w-5xl space-y-10">

        {/* FORM */}
        <form
          action={createExpenseAction}
          className="border border-white/10 p-6 bg-white/[0.03] space-y-4"
        >
          <input name="description" placeholder="Descripción" className="input-dark" />
          <input name="amount" type="number" placeholder="Monto" className="input-dark" />
          <input name="currency" placeholder="Moneda" className="input-dark" />
          <input name="type" placeholder="Tipo" className="input-dark" />
          <input name="category" placeholder="Categoría" className="input-dark" />

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="paid" />
            Ya está pagado
          </label>

          <button className="bg-white px-4 py-2 text-black">
            Crear gasto
          </button>
        </form>

        {/* LISTA */}
        <div className="grid gap-4">
          {expenses.map((e) => (
            <div
              key={e.id}
              className="border border-white/10 p-4 bg-white/[0.03] flex flex-col sm:flex-row sm:justify-between gap-3"
            >
              <div>
                <p className="font-semibold">{e.description}</p>
                <p className="text-sm text-neutral-400">
                  {e.currency} {e.amount}
                </p>
              </div>

              <form
                action={toggleExpensePaidAction.bind(null, e.id, e.paid)}
              >
                <button
                  className={`px-3 py-1 text-xs border ${
                    e.paid
                      ? "border-green-500 text-green-300"
                      : "border-red-500 text-red-300"
                  }`}
                >
                  {e.paid ? "Pagado" : "Marcar pagado"}
                </button>
              </form>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}