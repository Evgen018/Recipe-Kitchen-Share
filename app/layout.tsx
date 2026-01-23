import type { Metadata } from 'next'
import './globals.css'
import { Header } from './components/Header'

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
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}
