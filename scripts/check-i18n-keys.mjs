#!/usr/bin/env node
/**
 * Проверка ключей i18n: ru.json и cnr.json должны быть валидным JSON,
 * в cnr.json есть все ключи из ru.json.
 * Запуск: npm run check:i18n (из корня проекта).
 */

import { readFileSync } from 'fs'
import { join } from 'path'

const ROOT = process.cwd()
const RU_PATH = join(ROOT, 'messages', 'ru.json')
const CNR_PATH = join(ROOT, 'messages', 'cnr.json')

function loadJson(path, name) {
  try {
    const raw = readFileSync(path, 'utf8')
    return JSON.parse(raw)
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.error(`[check:i18n] Файл не найден: ${path}`)
    } else {
      console.error(`[check:i18n] Невалидный JSON в ${name}:`, e.message)
    }
    process.exit(1)
  }
}

const ru = loadJson(RU_PATH, 'ru.json')
const cnr = loadJson(CNR_PATH, 'cnr.json')

const ruKeys = Object.keys(ru)
const cnrKeys = Object.keys(cnr)

const missing = ruKeys.filter((k) => !cnrKeys.includes(k))
if (missing.length) {
  console.error('[check:i18n] В cnr.json отсутствуют ключи из ru.json:')
  missing.forEach((k) => console.error(`  - ${k}`))
  process.exit(1)
}

const extra = cnrKeys.filter((k) => !ruKeys.includes(k))
if (extra.length) {
  console.warn('[check:i18n] В cnr.json есть ключи, которых нет в ru.json (допустимо):')
  extra.forEach((k) => console.warn(`  - ${k}`))
}

console.log(`[check:i18n] OK: ru ${ruKeys.length} ключей, cnr ${cnrKeys.length} ключей, все ключи ru есть в cnr.`)
