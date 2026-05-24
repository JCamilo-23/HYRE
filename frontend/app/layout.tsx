import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { NovaRoot } from '@/components/nova/nova-root'
import './globals.css'

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: '--font-display',
})

export const metadata: Metadata = {
  title: 'HYRE — Demuestra tu potencial con IA',
  description:
    'La plataforma Gen Z que conecta jovenes con oportunidades laborales mediante IA, simulaciones y entrevistas inteligentes.',
  generator: 'HYRE',
  keywords: [
    'empleo',
    'jovenes',
    'Gen Z',
    'IA',
    'hiring',
    'simulaciones laborales',
    'entrevistas IA',
    'trabajo',
  ],
  authors: [{ name: 'HYRE Team' }],
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
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0614',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark scroll-smooth">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased bg-background`}
      >
        {children}
        <NovaRoot />
      </body>
    </html>
  )
}
