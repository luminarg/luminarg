import { getDashboardMetrics } from "@/data/dashboard";
import { ExpensesByMonthChart } from "./components/ExpensesByMonthChart";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";

const profile = await getCurrentProfile();

if (!profile || !isInternalUser(profile.role)) {
  redirect("/login");
}

function formatMoney(value: number) {
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

  const expensesChartData = Object.entries(metrics.expenses.byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({
      month,
      amount,
    }));

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm uppercase tracking-[0.28em] text-neutral-500">
          Gestión interna
        </p>

        <h1 className="mt-3 text-4xl font-light text-white">
          Dashboard interno
        </h1>

        <p className="mt-3 max-w-2xl text-neutral-400">
          Métricas generales de Luminarg.
        </p>
      </header>

      {/* MÉTRICAS */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Gastos"
          value={metrics.expenses.totalCount}
          description="Registros cargados"
        />

        <MetricCard
          title="Productos"
          value={metrics.products.total}
          description="Activos en sistema"
        />

        <MetricCard
          title="Stock total"
          value={metrics.products.totalStock}
          description="Unidades disponibles"
          variant={
            metrics.products.totalStock === 0 ? "danger" : "success"
          }
        />

        <MetricCard
          title="Alertas"
          value={metrics.alerts.total}
          description="Requieren atención"
          variant={metrics.alerts.total > 0 ? "danger" : "success"}
        />
      </section>

      {/* GASTOS */}
      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold text-white">
            Gastos por moneda
          </h2>

          <div className="mt-4 space-y-2">
            {Object.entries(metrics.expenses.byCurrency).length === 0 ? (
              <p className="text-sm text-neutral-500">
                No hay gastos cargados.
              </p>
            ) : (
              Object.entries(metrics.expenses.byCurrency).map(
                ([currency, amount]) => (
                  <div
                    key={currency}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 p-4"
                  >
                    <span className="text-neutral-300">{currency}</span>
                    <span className="font-bold text-white">
                      {formatMoney(amount)}
                    </span>
                  </div>
                )
              )
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold text-white">
            Estado de gastos
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-green-800 bg-green-900/20 p-4">
              <p className="text-sm text-green-400">Pagados</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {formatMoney(metrics.expenses.byStatus.paid)}
              </p>
              <p className="text-sm text-neutral-400">
                {metrics.expenses.byStatus.paidCount} gastos
              </p>
            </div>

            <div className="rounded-xl border border-red-800 bg-red-900/20 p-4">
              <p className="text-sm text-red-400">Pendientes</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {formatMoney(metrics.expenses.byStatus.pending)}
              </p>
              <p className="text-sm text-neutral-400">
                {metrics.expenses.byStatus.pendingCount} gastos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ALERTAS */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-semibold text-white">
          Alertas inteligentes
        </h2>

        <div className="mt-4 space-y-3">
          {metrics.alerts.total === 0 ? (
            <p className="text-sm text-neutral-500">
              No hay alertas activas.
            </p>
          ) : (
            <>
              {metrics.products.outOfStock.map((product) => (
                <div
                  key={`out-${product.id}`}
                  className="rounded-xl border border-red-700 bg-red-900/20 p-4"
                >
                  <p className="font-semibold text-red-400">
                    Sin stock
                  </p>
                  <p className="text-sm text-neutral-300">
                    {product.name} (stock {product.stock})
                  </p>
                </div>
              ))}

              {metrics.products.lowStock.map((product) => (
                <div
                  key={`low-${product.id}`}
                  className="rounded-xl border border-yellow-700 bg-yellow-900/20 p-4"
                >
                  <p className="font-semibold text-yellow-400">
                    Stock bajo
                  </p>
                  <p className="text-sm text-neutral-300">
                    {product.name} (stock {product.stock})
                  </p>
                </div>
              ))}

              {metrics.alerts.highPendingExpenses.map((expense) => (
                <div
                  key={`expense-${expense.id}`}
                  className="rounded-xl border border-orange-700 bg-orange-900/20 p-4"
                >
                  <p className="font-semibold text-orange-400">
                    Gasto pendiente alto
                  </p>
                  <p className="text-sm text-neutral-300">
                    {expense.description} — {expense.currency}{" "}
                    {formatMoney(expense.amount)}
                  </p>
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      {/* GRÁFICO */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-semibold text-white">
          Gastos por mes
        </h2>

        <div className="mt-4">
          <ExpensesByMonthChart data={expensesChartData} />
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  title,
  value,
  description,
  variant = "default",
}: {
  title: string;
  value: string | number;
  description: string;
  variant?: "default" | "success" | "warning" | "danger";
}) {
  const styles = {
    default: "border-white/10 bg-white/[0.03]",
    success: "border-green-800 bg-green-900/20",
    warning: "border-yellow-800 bg-yellow-900/20",
    danger: "border-red-800 bg-red-900/20",
  };

  return (
    <div className={`rounded-2xl border p-6 ${styles[variant]}`}>
      <p className="text-sm text-neutral-400">{title}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      <p className="mt-2 text-sm text-neutral-400">{description}</p>
    </div>
  );
}