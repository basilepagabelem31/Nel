// Chemin : app/dashboard/notifications/page.tsx

import { Bell, Mail, Smartphone, BellDot } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { MarkNotificationsRead } from "@/components/dashboard/mark-notifications-read"

export const metadata = {
  title: "Notifications",
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0

  const typeIcon = (type: string) => {
    switch (type) {
      case "email": return <Mail className="h-5 w-5 text-blue-500" />
      case "sms": return <Smartphone className="h-5 w-5 text-green-500" />
      default: return <Bell className="h-5 w-5 text-primary" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} non lue(s)` : "Toutes lues"}
          </p>
        </div>
        {unreadCount > 0 && (
          <MarkNotificationsRead userId={user.id} />
        )}
      </div>

      {notifications && notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card key={notif.id} className={!notif.is_read ? "border-primary/30 bg-primary/5" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    {typeIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {notif.subject && (
                          <p className="font-medium text-sm">{notif.subject}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-0.5">{notif.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notif.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric", month: "long", year: "numeric",
                            hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune notification</h3>
            <p className="text-muted-foreground">
              Vous serez notifié des mises à jour de vos commandes et consultations
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}