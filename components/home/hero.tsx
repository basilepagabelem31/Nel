import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-accent/20" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />
      
      {/* African Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c45a3a' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Nouvelle Collection 2024
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-balance">
              Celebrez votre <span className="text-primary">Heritage</span> avec Elegance
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 text-pretty">
              Decouvrez notre collection exclusive de mode africaine, ou tradition et modernite 
              se rencontrent pour sublimer votre style unique.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/catalogue">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  Decouvrir la Collection
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/consultation">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Consultation Gratuite
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border">
              <div>
                <p className="text-3xl font-bold text-primary">500+</p>
                <p className="text-sm text-muted-foreground">Pieces uniques</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">15+</p>
                <p className="text-sm text-muted-foreground">Pays africains</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">2000+</p>
                <p className="text-sm text-muted-foreground">Clients satisfaits</p>
              </div>
            </div>
          </div>

          {/* Image Grid */}
          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative h-64 rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400&h=500&fit=crop"
                    alt="Mode africaine femme"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-48 rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop"
                    alt="Accessoires africains"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="relative h-48 rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop"
                    alt="Tissu Kente"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-64 rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop"
                    alt="Mode africaine homme"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-4 -left-4 bg-card p-4 rounded-xl shadow-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-2xl">🌍</span>
                </div>
                <div>
                  <p className="font-semibold">Artisanat Authentique</p>
                  <p className="text-sm text-muted-foreground">Fait main en Afrique</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
