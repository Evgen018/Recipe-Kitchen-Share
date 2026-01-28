import type { Metadata } from 'next'
import './globals.css'
import { getLocale, getMessages, getT } from '@/lib/i18n'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { LocaleProvider } from './components/LocaleProvider'

export const metadata: Metadata = {
  title: 'Recipe Kitchen Share',
  description: 'Минимальный проект Next.js + Prisma + NeonDB',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = getMessages(locale)
  const t = getT(locale)

  return (
    <html lang={locale === 'cnr' ? 'cnr' : 'ru'}>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <LocaleProvider locale={locale} messages={messages}>
          <Header locale={locale} t={t} />
          <main style={{ flex: 1 }}>
            {children}
          </main>
          <Footer locale={locale} t={t} />
        </LocaleProvider>
      </body>
    </html>
  )
}
