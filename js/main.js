import { supabaseClient } from './supabase.js'

console.log('Supabase connected:', supabaseClient)
console.log('URL:', import.meta.env.VITE_SUPABASE_URL)

import { initLanguage, setLanguage } from './i18n.js'

await initLanguage()

document
  .querySelector('#language-selector')
  .addEventListener('change', event => {
    setLanguage(event.target.value)
  })