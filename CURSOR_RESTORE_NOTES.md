# Восстановление работоспособности Recipe-Kitchen-Share в Cursor

**Дата:** 28 января 2026  
**Проблема:** Cursor зависал («Не отвечает») при открытии проекта Recipe-Kitchen-Share.  
**Результат:** Проект снова открывается и запускается без зависаний.

---

## 1. В чём была причина

- Cursor зависал из‑за **сканирования/индексации** тяжёлых папок: `node_modules` (~0.8 GB) и `.next` (~0.26 GB).
- Зависание было **только** на этом проекте; настройки Cursor (watcher, search, GPU) и `.cursorignore` не устраняли проблему при открытии **оригинальной** папки.
- Работоспособность восстановили, перейдя на **копию проекта без** `node_modules` и `.next`, затем установив зависимости и сделав эту копию основной.

---

## 2. Что было сделано по шагам

### 2.1. Настройки Cursor (применены, но на оригинале всё равно зависало)

- **Файл:** `C:\Users\ED2021\AppData\Roaming\Cursor\argv.json`  
  - Создан с содержимым: `{ "disable-hardware-acceleration": true }`  
  - Нужен, если Cursor не создал его сам.

- **Файл:** `C:\Users\ED2021\AppData\Roaming\Cursor\User\settings.json`  
  - Добавлены исключения (все поля внутри одного JSON-объекта, через запятые):
    - `files.watcherExclude` — не следить за `node_modules`, `.next`, `.git`, `.prisma`, `dist`, `build`, `.cache`.
    - `search.exclude` — не искать в этих же папках.

- **Запуск с отключённым GPU (если понадобится снова):**
  ```powershell
  & "C:\Users\ED2021\AppData\Local\Programs\cursor\resources\app\bin\cursor.cmd" --disable-gpu "D:\AI\Cursor\Curs_Cursor\Recipe-Kitchen-Share"
  ```

### 2.2. Файлы в корне проекта Recipe-Kitchen-Share

- **`.cursorignore`** — исключить из индексации Cursor:
  ```
  node_modules/
  .next/
  .prisma/
  dist/
  build/
  coverage/
  .cache/
  tmp/
  temp/
  .git/
  .vscode/
  ```

- **`.cursorindexingignore`** — то же для индексации (без `.vscode/` при необходимости):
  ```
  node_modules/
  .next/
  .prisma/
  dist/
  build/
  coverage/
  .cache/
  tmp/
  temp/
  .git/
  ```

- **`tsconfig.json`** — из `include` убраны пути в `.next`, чтобы TypeScript не сканировал сборку:
  - Удалены строки: `".next/types/**/*.ts"`, `".next/dev/types/**/*.ts"`.
  - Оставлено: `"next-env.d.ts"`, `"**/*.ts"`, `"**/*.tsx"`.

- **`.vscode/settings.json`** — исключения watcher и search для этого проекта (те же папки, что выше).

### 2.3. Решение, которое сработало

1. Сделана **копия проекта без** `node_modules` и `.next` (через robocopy с исключением этих папок) → `Recipe-Kitchen-Share-test`.
2. В Cursor открывался **только** `Recipe-Kitchen-Share-test` — зависаний не было.
3. Папки переименованы:
   - `Recipe-Kitchen-Share` → `Recipe-Kitchen-Share-old`
   - `Recipe-Kitchen-Share-test` → `Recipe-Kitchen-Share`
4. В новой папке `Recipe-Kitchen-Share` выполнено: `npm install`.
5. Проект открыт в Cursor и запущен через `npm run dev` — всё работает.

---

## 3. Что оставить в проекте на будущее

- Не удалять **`.cursorignore`** и **`.cursorindexingignore`**.
- Не возвращать в **`tsconfig.json`** в `include` пути `.next/types/**` и `.next/dev/types/**`.
- При повторном зависании Cursor на этой папке — снова открывать с флагом `--disable-gpu` или проверять, не разрослись ли `node_modules`/`.next` и не тянет ли что-то лишнее (например, старые копии проекта).

---

## 4. Предупреждение в терминале при `npm run dev`

- Сообщение: `Failed to benchmark file I/O: Системе не удается найти указанный путь. (os error 3)`  
- Это предупреждение **Turbopack** о бенчмарке файловой системы; на работу приложения оно не влияет.  
- Приложение доступно на `http://localhost:3000`. При желании можно очистить кеш: удалить папку `.next` и снова запустить `npm run dev`.

---

## 5. Краткая шпаргалка

| Что проверить | Где |
|---------------|-----|
| Исключения watcher/search | `settings.json` (User) и `.vscode/settings.json` |
| Исключения индексации Cursor | `.cursorignore`, `.cursorindexingignore` |
| TypeScript не тянет .next | `tsconfig.json` → `include` без `.next/...` |
| Запуск без GPU | `cursor.cmd --disable-gpu "путь\к\проекту"` |
| Аппаратное ускорение | `%APPDATA%\Cursor\argv.json` → `disable-hardware-acceleration: true` |

Если снова возникнут зависания — сначала открывать проект с `--disable-gpu`, затем проверять размеры `node_modules` и `.next` и при необходимости повторить схему «копия без тяжёлых папок → npm install → переименование».
