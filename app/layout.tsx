import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Peter's Helper",
  description: 'A helper app for Peter',
  manifest: '/manifest.json',
  themeColor: '#1a56db',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "Peter's Helper",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">{children}</body>
    </html>
  )
}
