/**
 * aiService.ts
 * Funciones de IA para el módulo de compras/importaciones.
 * Usa Google Gemini Flash (capa gratuita).
 *
 * Funciones disponibles:
 *  - sugerirReposicion()         → qué pedir y cuánto, dado stock y velocidad de ventas
 *  - distribuirCostosImportacion()  → distribuye flete/aduana/agente entre productos
 */

import { geminiFlash } from "@/lib/gemini";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// ─── TIPOS EXPORTADOS ────────────────────────────────────────────────────────

export type SugerenciaItem = {
  product_id: number;
  product_name: string;
  quantity_suggested: number;
  days_of_stock_remaining: number;
  reason: string;
};

export type SugerenciaReposicion = {
  items: SugerenciaItem[];
  summary: string;
  generated_at: string;
};

export type ItemParaDistribucion = {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number | null;
  currency: string;
};

export type CostoAdicional = {
  type: string;
  description: string;
  amount: number;
  currency: string;
};

export type DistribucionItem = {
  product_id: number;
  product_name: string;
  additional_cost_per_unit: number;
  total_cost_per_unit: number;
};

export type DistribucionCostos = {
  items: DistribucionItem[];
  total_additional_costs_usd: number;
  summary: string;
};

// ─── HELPER: Velocidad de ventas por producto (últimos N días) ───────────────

async function getVelocidadVentas(dias = 90): Promise<Record<number, number>> {
  const desde = new Date();
  desde.setDate(desde.getDate() - dias);

  // 1. Obtener IDs de ventas no canceladas en el período
  const { data: ventas } = await supabaseAdmin
    .from("sales")
    .select("id")
    .neq("status", "cancelled")
    .gte("created_at", desde.toISOString());

  if (!ventas || ventas.length === 0) return {};

  const saleIds = ventas.map((v: any) => v.id);

  // 2. Sumar cantidades por producto
  const { data: items } = await supabaseAdmin
    .from("sale_items")
    .select("product_id, quantity")
    .in("sale_id", saleIds);

  if (!items) return {};

  const velocidad: Record<number, number> = {};
  for (const item of items as any[]) {
    if (!item.product_id) continue;
    velocidad[item.product_id] = (velocidad[item.product_id] ?? 0) + Number(item.quantity);
  }

  return velocidad;
}

// ─── FUNCIÓN 1: Sugerencia de reposición ─────────────────────────────────────

export async function sugerirReposicion(): Promise<SugerenciaReposicion> {
  // Obtener productos activos con sus capas de stock
  const { data: productos, error } = await supabaseAdmin
    .from("products")
    .select("id, name, sku, stock, stock_en_transito, stock_en_pedido, status")
    .eq("is_active", true)
    .order("name");

  if (error || !productos) {
    throw new Error("No se pudieron obtener los productos");
  }

  // Velocidad de ventas últimos 90 días
  const velocidad = await getVelocidadVentas(90);

  // Armar contexto para la IA
  const datos = productos.map((p: any) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    stock_fisico: Number(p.stock ?? 0),
    stock_en_transito: Number(p.stock_en_transito ?? 0),
    stock_en_pedido: Number(p.stock_en_pedido ?? 0),
    ventas_90_dias: velocidad[p.id] ?? 0,
  }));

  const prompt = `Sos un asistente de gestión de stock para Luminarg, empresa importadora argentina de luminarias.

Analizá los siguientes productos y determiná cuáles necesitan reposición urgente o próxima.

PARÁMETROS DE IMPORTACIÓN:
- Lead time: 60 días (tiempo desde que se hace el pedido hasta que llega)
- Buffer de seguridad: 30 días (stock mínimo después de recibir el pedido)
- Total cobertura mínima necesaria: 90 días de demanda

COLUMNAS DE STOCK:
- "stock_fisico": unidades en depósito, disponibles para vender HOY
- "stock_en_transito": comprado, pagado, viajando (llega en ~60 días)
- "stock_en_pedido": en orden de compra abierta aún no despachada
- "ventas_90_dias": unidades vendidas en los últimos 90 días (excluyendo canceladas)

LÓGICA: Si (stock_fisico + stock_en_transito + stock_en_pedido) cubre menos de 90 días de demanda, recomendá reponer.
Para calcular días de demanda: si ventas_90_dias > 0, velocidad_diaria = ventas_90_dias / 90.

PRODUCTOS:
${JSON.stringify(datos, null, 2)}

Respondé SOLO con JSON válido, sin texto adicional:
{
  "items": [
    {
      "product_id": number,
      "product_name": string,
      "quantity_suggested": number,
      "days_of_stock_remaining": number,
      "reason": "string en español, máximo 100 caracteres"
    }
  ],
  "summary": "string en español, máximo 180 caracteres con el resumen general"
}

Incluí solo los productos que realmente necesiten reposición. Si un producto no tiene ventas históricas Y tiene stock, no lo incluyas.`;

  const result = await geminiFlash.generateContent(prompt);
  const text = result.response.text();

  try {
    const parsed = JSON.parse(text);
    return {
      items: parsed.items ?? [],
      summary: parsed.summary ?? "",
      generated_at: new Date().toISOString(),
    };
  } catch {
    throw new Error("La IA devolvió una respuesta con formato inválido");
  }
}

// ─── FUNCIÓN 2: Distribución de costos de importación ────────────────────────

export async function distribuirCostosImportacion(input: {
  items: ItemParaDistribucion[];
  costos_adicionales: CostoAdicional[];
  tipo_de_cambio: number;
}): Promise<DistribucionCostos> {
  if (input.items.length === 0) {
    throw new Error("La orden no tiene productos para distribuir costos");
  }

  if (input.costos_adicionales.length === 0) {
    throw new Error("No hay costos adicionales para distribuir");
  }

  const prompt = `Sos un contador especializado en costos de importación para una empresa argentina importadora de luminarias.

Distribuí los costos adicionales de importación entre los productos de la orden de compra.

TIPO DE CAMBIO: 1 USD = ${input.tipo_de_cambio} ARS

PRODUCTOS EN LA ORDEN:
${JSON.stringify(input.items, null, 2)}

COSTOS ADICIONALES A DISTRIBUIR:
${JSON.stringify(input.costos_adicionales, null, 2)}

INSTRUCCIONES:
1. Convertí todos los costos adicionales a USD usando el tipo de cambio (si están en ARS, dividí por ${input.tipo_de_cambio}).
2. Sumá el total de costos adicionales en USD.
3. Calculá el valor de cada línea: quantity × unit_price (en USD). Si unit_price es null, distribuí en partes iguales por cantidad.
4. Distribuí los costos proporcionalmente al valor de cada línea.
5. "additional_cost_per_unit" = costo adicional asignado a esa línea / quantity (en USD, redondeado a 4 decimales).
6. "total_cost_per_unit" = unit_price + additional_cost_per_unit (en USD). Si unit_price era null, usá solo el additional_cost_per_unit.

Respondé SOLO con JSON válido, sin texto adicional:
{
  "items": [
    {
      "product_id": number,
      "product_name": string,
      "additional_cost_per_unit": number,
      "total_cost_per_unit": number
    }
  ],
  "total_additional_costs_usd": number,
  "summary": "string en español, máximo 180 caracteres"
}`;

  const result = await geminiFlash.generateContent(prompt);
  const text = result.response.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("La IA devolvió una respuesta con formato inválido");
  }
}
