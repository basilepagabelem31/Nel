import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

const categories = [
  {
    name: "Robes",
    slug: "robes",
    description: "Elegance africaine",
    image: "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400&h=500&fit=crop",
    count: 45,
  },
  {
    name: "Ensembles",
    slug: "ensembles",
    description: "Coordonnes modernes",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop",
    count: 32,
  },
  {
    name: "Accessoires",
    slug: "accessoires",
    description: "Bijoux & Sacs",
    image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=500&fit=crop",
    count: 68,
  },
  {
    name: "Hommes",
    slug: "hommes",
    description: "Style masculin",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
    count: 28,
  },
  {
    name: "Mariage",
    slug: "mariage",
    description: "Ceremonies speciales",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=500&fit=crop",
    count: 24,
  },
  {
    name: "Enfants",
    slug: "enfants",
    description: "Mini fashionistas",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=500&fit=crop",
    count: 35,
  },
]

export function CategoriesSection() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Explorez nos Collections</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Des pieces uniques inspirees des traditions africaines, confectionnees avec passion 
            et savoir-faire artisanal.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/catalogue?category=${category.slug}`}
              className="group relative overflow-hidden rounded-xl aspect-[3/4] shadow-md hover:shadow-xl transition-all duration-300"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-bold text-lg">{category.name}</h3>
                <p className="text-sm text-white/80">{category.description}</p>
                <p className="text-xs text-white/60 mt-1">{category.count} articles</p>
              </div>
              <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-4 w-4 text-white" />
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            Voir toutes les categories
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
