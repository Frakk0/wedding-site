import { supabaseClient } from './supabase.js'

console.log('Supabase connected:', supabaseClient)
console.log('URL:', import.meta.env.VITE_SUPABASE_URL)

import { initLanguage, setLanguage } from './i18n.js'

import scheduleHtml from '../schedule.html?raw'
import faqHtml from '../faq.html?raw'
import giftsHtml from '../gifts.html?raw'

document.querySelector('#schedule').innerHTML = scheduleHtml
document.querySelector('#faq').innerHTML = faqHtml
document.querySelector('#gifts').innerHTML = giftsHtml

await initLanguage()

document
  .querySelector('#language-selector')
  .addEventListener('change', event => {
    setLanguage(event.target.value)
  })