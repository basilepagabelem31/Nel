// Chemin : app/admin/orders/page.tsx
import { createClient } from "@/lib/supabase/server"
import { OrdersClient } from "./orders-client"

export const metadata = {
  title: "Gestion des Commandes",
}

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      profiles (first_name, last_name, email),
      order_items (id)
    `)
    .order("created_at", { ascending: false })

  // Passe les données au composant client
  return <OrdersClient initialOrders={orders || []} />
}