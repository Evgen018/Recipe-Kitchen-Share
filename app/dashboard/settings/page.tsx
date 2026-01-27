import { getLocale, getT } from '@/lib/i18n'

export default async function DashboardSettingsPage() {
  const locale = await getLocale()
  const t = getT(locale)
  return (
    <>
      <h1 className="text-2xl font-semibold text-slate-900">{t('dashboard.title')}</h1>
      <h2 className="mt-1 text-lg text-slate-600">{t('sidebar.settings')}</h2>
      <p className="mt-8 text-slate-500">{t('dashboard.comingSoon')}</p>
    </>
  )
}
