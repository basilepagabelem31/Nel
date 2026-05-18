import Link from "next/link"
import { CheckCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-background to-accent/20 px-4">
      <Card className="w-full max-w-md border-border/50 shadow-xl text-center">
        <CardHeader>
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Compte cree avec succes !</CardTitle>
          <CardDescription>
            Bienvenue dans la communaute Nella@House
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-left">
              Un email de confirmation a ete envoye a votre adresse. 
              Veuillez cliquer sur le lien pour activer votre compte.
            </p>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {"Vous n'avez pas recu l'email ? Verifiez vos spams ou "}
            <button className="text-primary hover:underline">
              renvoyer le lien
            </button>
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Link href="/auth/login" className="w-full">
            <Button className="w-full">Aller a la connexion</Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full">Retour a la boutique</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
