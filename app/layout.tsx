import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const geist = Geist({ 
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
  description: 'Decouvrez notre collection exclusive de mode africaine. Robes, ensembles, accessoires et tenues de mariage inspires des traditions africaines.',
  keywords: ['mode africaine', 'vetements africains', 'ankara', 'kente', 'wax', 'boubou', 'mariage africain'],
  authors: [{ name: 'Nella@House Consulting' }],
  creator: 'Nella@House Consulting',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://nellahouse.com',
    siteName: 'Nella@House Consulting',
    title: 'Nella@House Consulting - Mode Africaine Premium',
    description: 'Collection exclusive de mode africaine authentique',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nella@House Consulting',
    description: 'Mode Africaine Premium',
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
    <html lang="fr" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-background">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
