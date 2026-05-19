// app/auth/sign-up-success/page.tsx
import { Suspense } from "react"
import SignUpSuccessContent from "./sign-up-success-content"

export const metadata = {
  title: "Inscription réussie",
}

export default function SignUpSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <SignUpSuccessContent />
    </Suspense>
  )
}