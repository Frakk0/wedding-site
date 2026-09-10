let translations = {}
let currentLanguage = 'en'

const supportedLanguages = ['en', 'it', 'ru']

export function getLanguage() {
  return currentLanguage
}

export function t(key, variables = {}) {
  const value = key
    .split('.')
    .reduce((object, part) => object?.[part], translations)

  if (typeof value !== 'string') {
    console.warn(`Missing translation: ${key}`)
    return key
  }

  return Object.entries(variables).reduce(
    (result, [name, replacement]) =>
      result.replaceAll(`{${name}}`, replacement),
    value
  )
}


export async function setLanguage(language) {
  if (!supportedLanguages.includes(language)) {
    language = 'en'
  }

  const response = await fetch(`/locales/${language}.json`)

  if (!response.ok) {
    throw new Error(
      `Could not load /locales/${language}.json (${response.status})`
    )
  }

  const contentType = response.headers.get('content-type')

  if (!contentType?.includes('application/json')) {
    throw new Error(
      `Expected JSON for language "${language}", but received ${contentType}`
    )
  }

  translations = await response.json()
  currentLanguage = language

  localStorage.setItem('language', language)
  document.documentElement.lang = language

  translatePage()
}

export function translatePage() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    element.textContent = t(element.dataset.i18n)
  })
}

export async function initLanguage() {
  const savedLanguage = localStorage.getItem('language')

  const browserLanguage =
    navigator.language?.slice(0, 2)

  const initialLanguage =
    supportedLanguages.includes(savedLanguage)
      ? savedLanguage
      : supportedLanguages.includes(browserLanguage)
        ? browserLanguage
        : 'en'

  await setLanguage(initialLanguage)
}