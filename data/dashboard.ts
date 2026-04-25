import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getDashboardMetrics() {
  const [expensesResult, productsResult, usersResult] = await Promise.all([
    supabaseAdmin.from("expenses").select("*"),
    supabaseAdmin.from("products").select("*"),
    supabaseAdmin.from("profiles").select("*"),
  ]);

  const expenses = expensesResult.data ?? [];
  const products = productsResult.data ?? [];
  const users = usersResult.data ?? [];

  const totalExpenses = expenses.reduce((acc, expense) => {
    return acc + Number(expense.amount ?? 0);
  }, 0);

  const expensesByCurrency = expenses.reduce<Record<string, number>>(
    (acc, expense) => {
      const currency = expense.currency ?? "SIN MONEDA";
      acc[currency] = (acc[currency] ?? 0) + Number(expense.amount ?? 0);
      return acc;
    },
    {}
  );

  const expensesByStatus = expenses.reduce(
    (acc, expense) => {
      if (expense.is_paid) {
        acc.paid += Number(expense.amount ?? 0);
        acc.paidCount += 1;
      } else {
        acc.pending += Number(expense.amount ?? 0);
        acc.pendingCount += 1;
      }

      return acc;
    },
    {
      paid: 0,
      pending: 0,
      paidCount: 0,
      pendingCount: 0,
    }
  );

  const expensesByMonth = expenses.reduce<Record<string, number>>(
    (acc, expense) => {
      const rawDate =
        expense.date ??
        expense.created_at ??
        expense.createdAt;

      if (!rawDate) return acc;

      const date = new Date(rawDate);

      if (Number.isNaN(date.getTime())) return acc;

      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      acc[monthKey] = (acc[monthKey] ?? 0) + Number(expense.amount ?? 0);

      return acc;
    },
    {}
  );

  const totalProducts = products.length;

  const totalStock = products.reduce((acc, product) => {
    return acc + Number(product.stock ?? 0);
  }, 0);

  const outOfStockProducts = products
  .filter((product) => Number(product.stock ?? 0) <= 0)
  .map((product) => ({
    id: product.id,
    name: product.name,
    stock: Number(product.stock ?? 0),
  }));

const lowStockProducts = products
  .filter((product) => {
    const stock = Number(product.stock ?? 0);
    return stock > 0 && stock <= 5;
  })
  .map((product) => ({
    id: product.id,
    name: product.name,
    stock: Number(product.stock ?? 0),
  }));

const highPendingExpenses = expenses
  .filter((expense) => {
    const amount = Number(expense.amount ?? 0);
    return !expense.is_paid && amount >= 100000;
  })
  .map((expense) => ({
    id: expense.id,
    description: expense.description ?? expense.category ?? "Gasto sin detalle",
    amount: Number(expense.amount ?? 0),
    currency: expense.currency ?? "SIN MONEDA",
  }));

  const usersByRole = users.reduce<Record<string, number>>((acc, user) => {
    const role = user.role ?? "sin rol";
    acc[role] = (acc[role] ?? 0) + 1;
    return acc;
  }, {});

  return {
    expenses: {
      totalAmount: totalExpenses,
      totalCount: expenses.length,
      byCurrency: expensesByCurrency,
      byStatus: expensesByStatus,
      byMonth: expensesByMonth,
    },
  products: {
  total: totalProducts,
  totalStock,
  lowStock: lowStockProducts,
  lowStockCount: lowStockProducts.length,
  outOfStock: outOfStockProducts,
  outOfStockCount: outOfStockProducts.length,
},
alerts: {
  total:
    outOfStockProducts.length +
    lowStockProducts.length +
    highPendingExpenses.length,
  highPendingExpenses,
},
    users: {
      total: users.length,
      byRole: usersByRole,
    },
  };
}