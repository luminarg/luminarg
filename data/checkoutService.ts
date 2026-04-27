import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function createSaleFromCheckout({
  userId,
  userEmail,
  cart,
  shipping,
}: any) {
  const supabase = await createSupabaseServerClient();

  if (!cart.length) {
    throw new Error("El carrito está vacío");
  }

  const subtotal = cart.reduce(
    (acc: number, item: any) => acc + item.price * item.quantity,
    0
  );

  const total = subtotal;

  let { data: profile } = await supabase
    .from("customer_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    const { data: createdProfile, error: createProfileError } = await supabase
      .from("customer_profiles")
      .insert({
        id: userId,
        full_name: shipping.name,
        phone: shipping.phone,
        customer_type: "minorista",
        is_approved: true,
      })
      .select()
      .single();

    if (createProfileError || !createdProfile) {
      console.error(createProfileError);
      throw new Error("No se pudo crear el perfil del cliente");
    }

    profile = createdProfile;
  }

  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert({
      customer_id: userId,
      customer_name: profile.full_name || shipping.name || "Cliente",
      customer_email: userEmail,
      customer_phone: profile.phone || shipping.phone,

      status: "pending_payment",
      payment_status: "pending",
      delivery_status: "pending",

      subtotal,
      discount_amount: 0,
      shipping_amount: 0,
      total_amount: total,

      shipping_recipient_name: shipping.name,
      shipping_recipient_phone: shipping.phone,
      shipping_street: shipping.street,
      shipping_street_number: shipping.number,
      shipping_floor_apartment: shipping.floorApartment || null,
      shipping_city: shipping.city,
      shipping_province: shipping.province,
      shipping_postal_code: shipping.postalCode || null,
      shipping_reference: shipping.reference || null,

      notes: "Pago a coordinar con Luminarg.",
    })
    .select()
    .single();

  if (saleError || !sale) {
    console.error(saleError);
    throw new Error("Error creando venta");
  }

  const items = cart.map((item: any) => ({
    sale_id: sale.id,
    product_id: item.product_id,
    product_name: item.name,
    unit_price: item.price,
    quantity: item.quantity,
    subtotal: item.price * item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("sale_items")
    .insert(items);

  if (itemsError) {
    console.error(itemsError);
    throw new Error("Error creando items");
  }

  const { error: paymentError } = await supabase
    .from("sale_payments")
    .insert({
      sale_id: sale.id,
      method: "other",
      amount: total,
      status: "pending",
      provider: "manual",
      external_reference: "Pago a coordinar",
    });

  if (paymentError) {
    console.error(paymentError);
    throw new Error("Error creando pago");
  }

  return sale;
}