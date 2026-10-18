let translations = {}
const defaultLanguage = 'it'
let currentLanguage = defaultLanguage

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
    language = defaultLanguage
  }

  const localesUrl = `${import.meta.env.BASE_URL}locales/${language}.json`
  const response = await fetch(localesUrl)

  if (!response.ok) {
    throw new Error(
      `Could not load ${localesUrl} (${response.status})`
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

  // Keep the selector in sync with what is actually displayed
  const languageSelector = document.querySelector('#language-selector')
  if (languageSelector) {
    languageSelector.value = language
  }

  translatePage()
}

export function translatePage() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    element.textContent = t(element.dataset.i18n)
  })
}

export async function initLanguage() {
  const savedLanguage = localStorage.getItem('language')

  await setLanguage(
    supportedLanguages.includes(savedLanguage) ? savedLanguage : defaultLanguage
  )
}