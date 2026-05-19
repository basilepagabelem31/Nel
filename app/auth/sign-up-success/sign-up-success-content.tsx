// app/auth/sign-up-success/sign-up-success-content.tsx
"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Mail, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

export default function SignUpSuccessContent() {
  const [isResending, setIsResending] = useState(false)
  const [email, setEmail] = useState<string>("")
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Récupérer l'email depuis les paramètres d'URL ou localStorage
  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
      localStorage.setItem("signup_email", emailParam)
    } else {
      const storedEmail = localStorage.getItem("signup_email")
      if (storedEmail) setEmail(storedEmail)
    }

    // Récupérer l'email de l'utilisateur depuis Supabase si pas disponible
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email && !email) {
        setEmail(user.email)
      }
    }
    getUserEmail()
  }, [searchParams, supabase, email])

  const handleResendEmail = async () => {
    if (!email) {
      toast.error("Email non trouvé")
      return
    }

    setIsResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success("Email de confirmation renvoyé ! Vérifiez votre boîte de réception.")
      }
    } catch (error) {
      toast.error("Erreur lors du renvoi")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-background to-accent/20 px-4">
      <Card className="w-full max-w-md border-border/50 shadow-xl text-center">
        <CardHeader>
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Compte créé avec succès !</CardTitle>
          <CardDescription>
            Bienvenue dans la communauté Nella@House
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="text-left">
              <p className="text-sm">
                Un email de confirmation a été envoyé à <strong>{email || "votre adresse"}</strong>.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Veuillez cliquer sur le lien pour activer votre compte.
              </p>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Vous n'avez pas reçu l'email ? Vérifiez vos spams ou{" "}
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              {isResending ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : null}
              renvoyer le lien
            </button>
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Link href="/auth/login" className="w-full">
            <Button className="w-full">Aller à la connexion</Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full">Retour à la boutique</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}