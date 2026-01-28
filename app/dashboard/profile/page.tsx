import { auth } from '@/lib/auth'
import { getLocale, getT } from '@/lib/i18n'

export default async function DashboardProfilePage() {
  const session = await auth()
  if (!session?.user) return null

  const locale = await getLocale()
  const t = getT(locale)
  const { id, name, email } = session.user

  return (
    <>
      <h1 className="text-2xl font-semibold text-slate-900">{t('dashboard.title')}</h1>
      <h2 className="mt-1 text-lg text-slate-600">{t('dashboard.profileInfo')}</h2>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-slate-500">{t('profile.name')}</dt>
            <dd className="mt-0.5 text-slate-900">{name || email || '—'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">{t('profile.id')}</dt>
            <dd className="mt-0.5 font-mono text-sm text-slate-700">{id}</dd>
          </div>
          {email && (
            <div>
              <dt className="text-sm font-medium text-slate-500">{t('profile.email')}</dt>
              <dd className="mt-0.5 text-slate-900">{email}</dd>
            </div>
          )}
        </dl>
      </div>
    </>
  )
}
