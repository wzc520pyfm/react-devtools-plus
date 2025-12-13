import type { Metadata } from 'next'
import { DevToolsScript } from 'react-devtools-plus/next/client'
import './globals.css'

export const metadata: Metadata = {
  title: 'React DevTools Plus - Next.js Playground',
  description: 'Testing React DevTools Plus integration with Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <DevToolsScript basePath="/devtools" />
      </body>
    </html>
  )
}
