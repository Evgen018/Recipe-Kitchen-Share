# Деплой: Local → GitHub → Neon → Vercel

Пошаговый чеклист, чтобы ничего не упустить.

---

## 1. Local (перед коммитом)

- [ ] **Сборка проходит**
  ```powershell
  npm run build
  ```

- [ ] **Миграции в репозитории**  
  В `.gitignore` не должно быть `/prisma/migrations` — папка `prisma/migrations` должна коммититься.  
  Игнорируется только `prisma/generated` (её создаёт `prisma generate` при сборке).

- [ ] **`.env` не в Git**  
  В `.gitignore` есть `.env` и `.env*.local` — секреты не попадут в репозиторий.

- [ ] **Схема и конфиг Prisma**  
  - `prisma/schema.prisma` — `datasource` только с `provider` (в Prisma 7+ `url` не допускается в schema)
  - `prisma.config.ts` — `datasource.url` с `env('DATABASE_URL')` (и при необходимости `uselibpqcompat`)

- [ ] **proxy.ts, не middleware**  
  В корне — `proxy.ts` (с `export default` или `export function proxy`). Файла `middleware.ts` быть не должно.

---

## 2. GitHub

- [ ] **Создать репозиторий** (если ещё нет).

- [ ] **Закоммитить нужное**
  ```powershell
  git add .
  git status   # убедиться, что нет .env, .env.local
  git commit -m "Prepare for deploy"
  git push -u origin main
  ```

- [ ] **Что должно быть в репо**
  - `prisma/migrations/` — все миграции
  - `prisma/schema.prisma`
  - `prisma.config.ts`
  - `proxy.ts`
  - `app/`, `lib/`, `package.json`, `next.config.js`, `vercel.json` и т.п.

- [ ] **Чего не должно быть**
  - `.env`, `.env.local`, `.env.production.local`
  - `node_modules/`, `.next/`, `prisma/generated/`

---

## 3. Neon

- [ ] **Проект и БД**  
  [console.neon.tech](https://console.neon.tech) → проект → ветка (обычно `main`).

- [ ] **Connection string**  
  Скопировать **Connection string** (режим: Session или Transaction по необходимости).  
  Для продакшена лучше явно: `?sslmode=verify-full` (или как в `prisma.config`).

- [ ] **Миграции к Neon (первый раз или после новых миграций)**
  ```powershell
  $env:DATABASE_URL="postgresql://...ваша-строка-из-Neon..."
  npx prisma migrate deploy
  ```
  Или в `.env` временно подставить URL от Neon и выполнить ту же команду.

- [ ] **Проверка**
  ```powershell
  npx prisma migrate status
  ```
  Должно быть: все миграции применены, drift нет.

---

## 4. Vercel

### 4.1. Проект

- [ ] [vercel.com](https://vercel.com) → **Add New Project** → Import из GitHub.
- [ ] Выбрать репозиторий, ветку `main` (или нужную).
- [ ] **Framework Preset**: Next.js (должен определиться сам).
- [ ] **Build Command**: `prisma generate && next build` (или как в `vercel.json`).
- [ ] **Output Directory**: по умолчанию (если не правили).
- [ ] **Install Command**: `npm install` (по умолчанию).

### 4.2. Переменные окружения (Environment Variables)

Добавить для **Production** (и при необходимости Preview):

| Переменная         | Описание                          | Пример / примечание                          |
|--------------------|-----------------------------------|----------------------------------------------|
| `DATABASE_URL`     | Строка подключения к Neon        | `postgresql://user:pass@host/db?sslmode=verify-full` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID           | `xxx.apps.googleusercontent.com`            |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret   | Секрет из Google Cloud Console              |
| `AUTH_SECRET`      | Секрет для Auth.js/NextAuth      | `openssl rand -base64 32` или аналог        |

- [ ] **Опционально:** `AUTH_URL`  
  Если нужна явная база для callbacks:  
  `AUTH_URL=https://ваш-проект.vercel.app`  
  При `trustHost: true` в конфиге Auth часто можно не задавать.

### 4.3. Google Cloud Console (OAuth)

- [ ] [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
- [ ] OAuth 2.0 Client ID (Web application) → **Authorized redirect URIs**:
  - `http://localhost:3000/api/auth/callback/google` — для локальной разработки
  - `https://ваш-проект.vercel.app/api/auth/callback/google` — для Vercel
  - при кастомном домене:  
    `https://ваш-домен/api/auth/callback/google`

### 4.4. Деплой

- [ ] **Deploy** в Vercel.
- [ ] После первого успешного деплоя (если миграции ещё не применяли к продакшен-БД):

  ```powershell
  $env:DATABASE_URL="<production-DATABASE_URL-from-Vercel-or-Neon>"
  npx prisma migrate deploy
  ```

  Или настроить `DATABASE_URL` в `.env` на продакшен Neon и выполнить команду локально.

### 4.5. Проверка

- [ ] Открыть `https://ваш-проект.vercel.app`.
- [ ] Вход через Google — редирект на `/api/auth/callback/google`, затем в приложение (без ошибок 400/500).
- [ ] Защищённые маршруты (`/dashboard`, `/my-prompts`) редиректят на вход, если пользователь не авторизован.

---

## 5. Предупреждение «middleware» → «proxy»

Если при сборке на Vercel или локально видите:

> The "middleware" file convention is deprecated. Please use "proxy" instead.

- В проекте должен быть **`proxy.ts`** в корне с `export function proxy` (или `export default function proxy`), а **`middleware.ts`** — удалён.
- Если предупреждение всё ещё есть при использовании `auth()` из next-auth в `proxy` — это известное поведение; на работу деплоя оно не влияет. В будущем часть логики можно перенести в Layout/серверные компоненты.

---

## 6. Типичные ошибки

| Симптом | Что проверить |
|--------|----------------|
| `relation "accounts" does not exist` / `table "public.accounts" does not exist` | Миграции не применены к БД, которую использует Vercel. Выполнить `prisma migrate deploy` с `DATABASE_URL` от Neon для продакшена. |
| `DATABASE_URL not found` | Переменная не задана в Vercel → Project → Settings → Environment Variables (Production). |
| 400/500 при `/api/auth/callback/google` | `GOOGLE_*`, `AUTH_SECRET` в Vercel; в Google Console добавлен redirect URI `https://ваш-домен.vercel.app/api/auth/callback/google`. |
| `prisma migrate deploy` не находит миграции | `prisma/migrations` не в `.gitignore` и закоммичен в репо. |
| Сборка падает на `prisma generate` | В `package.json`/`vercel.json`: `prisma generate` в `build` или `postinstall`; `prisma/schema.prisma` и `prisma.config.ts` в репо. |

---

## 7. Краткая последовательность (напоминание)

1. **Local:** `npm run build`, миграции в Git, нет `middleware.ts`, есть `proxy.ts`.
2. **GitHub:** `git push`, в репо есть `prisma/migrations`, нет `.env`.
3. **Neon:** Connection string, `prisma migrate deploy` к этой БД.
4. **Vercel:** Import, `DATABASE_URL`, `GOOGLE_*`, `AUTH_SECRET`; в Google — redirect URI для продакшен-домена; после деплоя при необходимости снова `prisma migrate deploy` на продакшен `DATABASE_URL`.
