'use client'

import { useTranslations } from 'next-intl'
import { Truck, ShieldCheck, Leaf, HeartHandshake } from 'lucide-react'

const values = [
  {
    icon: Leaf,
    title: 'values.sustainable.title',
    description: 'values.sustainable.description',
  },
  {
    icon: HeartHandshake,
    title: 'values.artisans.title',
    description: 'values.artisans.description',
  },
  {
    icon: ShieldCheck,
    title: 'values.quality.title',
    description: 'values.quality.description',
  },
  {
    icon: Truck,
    title: 'values.shipping.title',
    description: 'values.shipping.description',
  },
]

export function ValueProposition() {
  const t = useTranslations('home')

  return (
    <section className="py-16 border-y border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value) => (
            <div
              key={value.title}
              className="flex flex-col items-center text-center gap-3"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <value.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{t(value.title)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(value.description)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
