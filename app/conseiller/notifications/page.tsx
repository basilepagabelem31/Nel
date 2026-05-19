// Chemin : app/conseiller/notifications/page.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Mail, Smartphone, Globe, CheckCheck } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

export const metadata = {
  title: "Mes notifications | Conseiller",
}

// ✅ Fonction pour marquer une notification comme lue (prend FormData)
async function markAsRead(formData: FormData) {
  "use server"
  const notificationId = formData.get("notification_id") as string
  const supabase = await createClient()
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
  redirect("/conseiller/notifications")
}

// ✅ Fonction pour tout marquer comme lu
async function markAllAsRead() {
  "use server"
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false)
  }
  redirect("/conseiller/notifications")
}

export default async function ConseillerNotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0

  const getIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-5 w-5" />
      case "sms":
        return <Smartphone className="h-5 w-5" />
      default:
        return <Globe className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount} notification{unreadCount > 1 ? "s" : ""} non lue{unreadCount > 1 ? "s" : ""}
          </p>
        </div>
        {unreadCount > 0 && (
          <form action={markAllAsRead}>
            <Button type="submit" variant="outline" className="gap-2">
              <CheckCheck className="h-4 w-4" />
              Tout marquer comme lu
            </Button>
          </form>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des notifications</CardTitle>
          <CardDescription>Recevez les alertes concernant vos consultations</CardDescription>
        </CardHeader>
        <CardContent>
          {notifications && notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                    !notification.is_read ? "bg-primary/5 border-primary/20" : "bg-card"
                  }`}
                >
                  <div className="mt-0.5">{getIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="font-semibold">{notification.subject}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.content}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <form action={markAsRead}>
                          <input type="hidden" name="notification_id" value={notification.id} />
                          <Button type="submit" variant="ghost" size="sm">
                            Marquer comme lu
                          </Button>
                        </form>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune notification</h3>
              <p className="text-muted-foreground">
                Vous serez notifié ici des mises à jour de vos consultations
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}