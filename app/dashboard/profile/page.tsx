import { auth } from '@/lib/auth'

export default async function DashboardProfilePage() {
  const session = await auth()
  if (!session?.user) return null

  const { id, name, email } = session.user

  return (
    <>
      <h1 className="text-2xl font-semibold text-slate-900">Личный кабинет</h1>
      <h2 className="mt-1 text-lg text-slate-600">Информация о пользователе</h2>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-slate-500">Имя</dt>
            <dd className="mt-0.5 text-slate-900">{name || email || '—'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">ID</dt>
            <dd className="mt-0.5 font-mono text-sm text-slate-700">{id}</dd>
          </div>
          {email && (
            <div>
              <dt className="text-sm font-medium text-slate-500">Email</dt>
              <dd className="mt-0.5 text-slate-900">{email}</dd>
            </div>
          )}
        </dl>
      </div>
    </>
  )
}
