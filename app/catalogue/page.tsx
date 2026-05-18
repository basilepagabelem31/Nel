import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CatalogueContent } from "@/components/catalogue/catalogue-content"
import { CatalogueFilters } from "@/components/catalogue/catalogue-filters"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Catalogue - Mode Africaine",
  description: "Decouvrez notre collection complete de vetements et accessoires africains authentiques.",
}

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-r from-secondary via-background to-accent/20 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Notre Catalogue</h1>
            <p className="text-muted-foreground">
              Explorez notre collection de mode africaine authentique
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-64 shrink-0">
              <Suspense fallback={<FiltersSkeleton />}>
                <CatalogueFilters />
              </Suspense>
            </aside>
            
            <div className="flex-1">
              <Suspense fallback={<ProductsSkeleton />}>
                <CatalogueContent searchParams={params} />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function FiltersSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    </div>
  )
}

function ProductsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-[3/4] rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}
