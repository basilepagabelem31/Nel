import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProductTabsProps {
  product: {
    description: string
    composition: string
    origin_country: string
    tags: string[]
  }
}

export function ProductTabs({ product }: ProductTabsProps) {
  return (
    <section className="py-8 bg-muted/30">
      <div className="container mx-auto px-4">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-auto p-0 gap-8">
            <TabsTrigger 
              value="description"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-4"
            >
              Description
            </TabsTrigger>
            <TabsTrigger 
              value="details"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-4"
            >
              Details & Composition
            </TabsTrigger>
            <TabsTrigger 
              value="livraison"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-4"
            >
              Livraison & Retours
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="pt-6">
            <div className="prose prose-neutral max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {product.description || "Pas de description disponible pour ce produit."}
              </p>
              {product.tags && product.tags.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="details" className="pt-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-4">Composition</h4>
                <p className="text-muted-foreground">
                  {product.composition || "Information non disponible"}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Origine</h4>
                <p className="text-muted-foreground">
                  Ce produit a ete fabrique en {product.origin_country || "Afrique"}.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Entretien</h4>
                <ul className="text-muted-foreground space-y-2">
                  <li>Lavage a la main recommande</li>
                  <li>Ne pas utiliser de javel</li>
                  <li>Sechage a plat a ombre</li>
                  <li>Repassage a temperature moyenne</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="livraison" className="pt-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-4">Livraison</h4>
                <ul className="text-muted-foreground space-y-2">
                  <li>France metropolitaine: 2-4 jours ouvrés</li>
                  <li>Europe: 5-7 jours ouvrés</li>
                  <li>International: 7-14 jours ouvrés</li>
                  <li className="text-primary font-medium">
                    Livraison gratuite a partir de 150EUR
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Retours</h4>
                <ul className="text-muted-foreground space-y-2">
                  <li>Retours gratuits sous 30 jours</li>
                  <li>Article dans son etat original</li>
                  <li>Etiquettes non detachees</li>
                  <li>Remboursement sous 5-7 jours</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
