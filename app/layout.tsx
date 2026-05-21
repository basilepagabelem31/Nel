// Chemin : app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from "@/lib/context/cart-context"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "@/components/ui/sonner"

import './globals.css'

const geistSans = Geist({ 
  subsets: ["latin"],
  variable: "--font-geist-sans"
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono"
})

export const metadata: Metadata = {
  title: {
    default: 'Nella@House Consulting - Mode Africaine Premium',
    template: '%s | Nella@House'
  },
  description: 'Découvrez notre collection exclusive de mode africaine. Vêtements, tissus, accessoires et prêt-à-porter. Livraison au Maroc, France et Afrique.',
  keywords: [
    'mode africaine',
    'vêtements africains',
    'tissus africains',
    'bazin',
    'soie africaine',
    'pagne',
    'kente',
    'ankara',
    'wax',
    'boubou',
    'robe africaine',
    'nellahouse',
    'nella house',
    'mode marocaine',
    'e-commerce afrique',
    'tenue africaine',
    'mariage africain'
  ],
  authors: [{ name: 'Nella@House Consulting' }],
  creator: 'Nella@House Consulting',
  publisher: 'Nella@House Consulting',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.nellahouseconsulting.com',
    siteName: 'Nella@House Consulting',
    title: 'Nella@House Consulting - Mode Africaine Premium',
    description: 'Découvrez notre collection exclusive de mode africaine authentique. Livraison rapide.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Nella@House Consulting - Mode Africaine Premium',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nella@House Consulting',
    description: 'Mode Africaine Premium',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  verification: {
    // À ajouter après inscription à Google Search Console
    // google: 'TON_CODE_VERIFICATION',
  },
  alternates: {
    canonical: 'https://www.nellahouseconsulting.com',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#c45a3a' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1412' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-background flex flex-col min-h-screen">
        <CartProvider>
          {/* <Header /> */}
          <main className="flex-1">
            {children}
          </main>
          {/* <Footer /> */}
          <Toaster richColors position="top-right" />
        </CartProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}