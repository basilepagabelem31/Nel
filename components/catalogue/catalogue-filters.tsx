"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { createClient } from "@/lib/supabase/client"

interface Category {
  id: string
  name: string
  slug: string
}

export function CatalogueFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [mobileOpen, setMobileOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("sort_order")
      
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [supabase])

  useEffect(() => {
    const category = searchParams.get("category")
    if (category) {
      setSelectedCategories([category])
    }
  }, [searchParams])

  const handleCategoryChange = (slug: string, checked: boolean) => {
    const newCategories = checked
      ? [...selectedCategories, slug]
      : selectedCategories.filter((c) => c !== slug)
    
    setSelectedCategories(newCategories)
    updateURL(newCategories, priceRange)
  }

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value)
  }

  const handlePriceCommit = () => {
    updateURL(selectedCategories, priceRange)
  }

  const updateURL = (cats: string[], price: number[]) => {
    const params = new URLSearchParams()
    if (cats.length > 0) params.set("category", cats.join(","))
    if (price[0] > 0) params.set("minPrice", price[0].toString())
    if (price[1] < 1000) params.set("maxPrice", price[1].toString())
    
    router.push(`/catalogue?${params.toString()}`)
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setPriceRange([0, 1000])
    router.push("/catalogue")
  }

  const hasActiveFilters = selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 1000

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-4">Categories</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.slug}
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={(checked) => handleCategoryChange(category.slug, !!checked)}
              />
              <Label htmlFor={category.slug} className="cursor-pointer">
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-4">Prix</h3>
        <Slider
          value={priceRange}
          onValueChange={handlePriceChange}
          onValueCommit={handlePriceCommit}
          max={1000}
          step={10}
          className="mb-4"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{priceRange[0]} EUR</span>
          <span>{priceRange[1]} EUR</span>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full gap-2">
          <X className="h-4 w-4" />
          Effacer les filtres
        </Button>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filtres
              {hasActiveFilters && (
                <span className="ml-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {selectedCategories.length + (priceRange[0] > 0 || priceRange[1] < 1000 ? 1 : 0)}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Filtres</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FiltersContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block sticky top-24 bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold mb-6">Filtres</h2>
        <FiltersContent />
      </div>
    </>
  )
}
