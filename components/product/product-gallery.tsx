"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProductGalleryProps {
  images: { id: string; url: string; alt_text: string; is_primary: boolean }[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  const displayImages = images.length > 0 
    ? images 
    : [{ id: "placeholder", url: "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800&h=1000&fit=crop", alt_text: productName, is_primary: true }]

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-[3/4] bg-secondary/50 rounded-2xl overflow-hidden group">
        <Image
          src={displayImages[selectedIndex]?.url}
          alt={displayImages[selectedIndex]?.alt_text || productName}
          fill
          className="object-cover"
          priority
        />
        
        {/* Zoom Button */}
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ZoomIn className="h-5 w-5" />
        </Button>

        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <Button
              size="icon"
              variant="secondary"
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
            {selectedIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative w-20 h-24 rounded-lg overflow-hidden shrink-0 border-2 transition-colors",
                selectedIndex === index 
                  ? "border-primary" 
                  : "border-transparent hover:border-primary/50"
              )}
            >
              <Image
                src={image.url}
                alt={image.alt_text || `${productName} ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
