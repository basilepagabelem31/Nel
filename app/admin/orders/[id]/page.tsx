// Chemin : app/admin/orders/[id]/page.tsx
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OrderDetailClient } from "./order-detail-client"

export const metadata = {
  title: "Détails de la commande",
}

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      profiles (first_name, last_name, email, phone),
      addresses (street, city, state, zip_code, country),
      order_items (
        id,
        quantity,
        unit_price,
        total_price,
        products (id, name, slug)
      ),
      payments (*)
    `)
    .eq("id", id)
    .single()

  if (error || !order) {
    notFound()
  }

  return <OrderDetailClient order={order} />
}