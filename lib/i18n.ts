import { cache } from 'react'
import { cookies } from 'next/headers'
import ru from '@/messages/ru.json'
import cnr from '@/messages/cnr.json'

export type Locale = 'ru' | 'cnr'

const messages: Record<Locale, Record<string, string>> = {
  ru: ru as Record<string, string>,
  cnr: cnr as Record<string, string>,
}

/** Читает локаль из cookie NEXT_LOCALE. По умолчанию ru. */
export const getLocale = cache(async (): Promise<Locale> => {
  const c = await cookies()
  const v = c.get('NEXT_LOCALE')?.value
  if (v === 'ru' || v === 'cnr') return v
  return 'ru'
})

/** Возвращает функцию перевода t(key) для данной локали. */
export function getT(locale: Locale): (key: string) => string {
  const m = messages[locale] ?? messages.ru
  return (key: string) => m[key] ?? key
}

/** Возвращает объект сообщений для локали (для LocaleProvider). */
export function getMessages(locale: Locale): Record<string, string> {
  return { ...(messages[locale] ?? messages.ru) }
}
