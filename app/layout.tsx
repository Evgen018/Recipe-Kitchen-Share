import type { Metadata } from 'next'
import './globals.css'
import { Header } from './components/Header'
import { Footer } from './components/Footer'

export const metadata: Metadata = {
  title: 'Recipe Kitchen Share',
  description: 'Минимальный проект Next.js + Prisma + NeonDB',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <main style={{ flex: 1 }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
