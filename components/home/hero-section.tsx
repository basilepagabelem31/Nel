'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  const t = useTranslations('home')

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 african-pattern opacity-50" />
      
      {/* Decorative elements */}
      <div className="absolute right-0 top-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      <div className="absolute left-1/4 bottom-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Tagline */}
          <p className="text-sm uppercase tracking-[0.3em] text-primary font-medium mb-6">
            {t('hero.tagline')}
          </p>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-balance leading-[1.1]">
            {t('hero.title')}
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            {t('hero.subtitle')}
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="text-base px-8 h-12">
              <Link href="/boutique">
                {t('hero.cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base px-8 h-12">
              <Link href="/consultation-style">
                {t('hero.ctaSecondary')}
              </Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              {t('hero.badge1')}
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              {t('hero.badge2')}
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              {t('hero.badge3')}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
