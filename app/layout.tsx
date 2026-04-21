import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'FlowDesk — Business Intelligence for Small Business Owners',
  description: 'Know your cash flow, forecast your runway, and act on real-time insights — in plain English. No spreadsheets, no data science required.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://api.fontshare.com" />
          <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=general-sans@200,300,400,500,600,700&display=swap" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;1,400&family=Instrument+Serif:ital@0;1&family=Syne:wght@400;500;600;700;800&display=swap" />
        </head>
        <body>
          <Providers>
            <div id="scroll-progress-bar" aria-hidden="true" />
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
