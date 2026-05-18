import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Calendar, Users, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ConsultationBanner() {
  return (
    <section className="py-20 bg-primary text-primary-foreground overflow-hidden relative">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Service de Consultation Personnalisee
            </h2>
            <p className="text-primary-foreground/90 text-lg mb-8">
              Vous avez un evenement special ? Nos conseillers en style africain vous 
              accompagnent pour trouver la tenue parfaite qui reflète votre personnalite 
              et celebre vos racines.
            </p>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Calendar className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium">RDV Flexible</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium">Experts Dediees</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Heart className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium">Sur Mesure</p>
              </div>
            </div>

            <Link href="/consultation">
              <Button size="lg" variant="secondary" className="gap-2">
                Prendre Rendez-vous
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=500&fit=crop"
                alt="Consultation mode africaine"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-card text-card-foreground p-6 rounded-xl shadow-xl max-w-xs">
              <div className="flex items-center gap-4 mb-3">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 bg-primary rounded-full border-2 border-card" />
                  <div className="w-10 h-10 bg-accent rounded-full border-2 border-card" />
                  <div className="w-10 h-10 bg-secondary rounded-full border-2 border-card" />
                </div>
                <div>
                  <p className="font-semibold">+150 consultations</p>
                  <p className="text-sm text-muted-foreground">ce mois-ci</p>
                </div>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="h-5 w-5 text-accent"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
