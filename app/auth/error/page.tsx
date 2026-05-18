import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-background to-accent/20 px-4">
      <Card className="w-full max-w-md border-border/50 shadow-xl text-center">
        <CardHeader>
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Erreur d authentification</CardTitle>
          <CardDescription>
            Une erreur est survenue lors de la verification de votre compte
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Le lien de confirmation a peut-etre expire ou a deja ete utilise.
            Veuillez reessayer de vous connecter ou creer un nouveau compte.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Link href="/auth/login" className="w-full">
            <Button className="w-full">Se connecter</Button>
          </Link>
          <Link href="/auth/sign-up" className="w-full">
            <Button variant="outline" className="w-full">Creer un compte</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
