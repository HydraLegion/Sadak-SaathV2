import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sadak Saathi — Road Intelligence Platform',
  description: 'AI-powered pothole detection, road safety analytics, and automated complaint management for smarter infrastructure across India.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Sadak Saathi',
  },
  keywords: ['pothole detection', 'road safety', 'AI analytics', 'government technology', 'infrastructure management'],
  authors: [{ name: 'Sadak Saathi Team' }],
  openGraph: {
    title: 'Sadak Saathi — Road Intelligence Platform',
    description: 'AI-powered pothole detection and road safety analytics',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-slate-950 antialiased font-sans">
        {children}
      </body>
    </html>
  )
}