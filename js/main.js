import { supabaseClient } from './supabase.js'

console.log('Supabase connected:', supabaseClient)
console.log('URL:', import.meta.env.VITE_SUPABASE_URL)

import { initLanguage, setLanguage } from './i18n.js'
import { initBee } from './bee.js'

import scheduleHtml from '../schedule.html?raw'
import faqHtml from '../faq.html?raw'
import giftsHtml from '../gifts.html?raw'

document.querySelector('#schedule').innerHTML = scheduleHtml
document.querySelector('#faq').innerHTML = faqHtml
document.querySelector('#gifts').innerHTML = giftsHtml

await initLanguage()

initBee()

document
  .querySelector('#language-selector')
  .addEventListener('change', event => {
    setLanguage(event.target.value)
  })

const navLinks = document.querySelectorAll('nav a[href^="#"]')

const sectionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        return
      }

      navLinks.forEach(link => {
        link.classList.toggle(
          'active',
          link.getAttribute('href') === `#${entry.target.id}`
        )
      })
    })
  },
  { rootMargin: '-50% 0px -50% 0px' }
)

document
  .querySelectorAll('main section[id]')
  .forEach(section => sectionObserver.observe(section))

const donationArea = document.querySelector('.donation-area')
const donationButton = document.querySelector('#donation-button')
const bankInfo = document.querySelector('#bank-info')

if (donationArea && donationButton && bankInfo) {
  let donationClicks = 0

  donationButton.addEventListener('click', () => {
    donationClicks += 1

    if (donationClicks >= 5) {
      bankInfo.hidden = false
      donationButton.hidden = true
      return
    }

    const halfWidth = donationButton.offsetWidth / 2
    const halfHeight = donationButton.offsetHeight / 2

    const maxLeft = Math.max(donationArea.clientWidth - halfWidth, halfWidth)
    const maxTop = Math.max(donationArea.clientHeight - halfHeight, halfHeight)

    const randomLeft = halfWidth + Math.random() * (maxLeft - halfWidth)
    const randomTop = halfHeight + Math.random() * (maxTop - halfHeight)
    const randomRotation = Math.random() * 90 - 45
    const randomScale = 0.85 + Math.random() * 0.5

    donationButton.style.left = `${randomLeft}px`
    donationButton.style.top = `${randomTop}px`
    donationButton.style.transform =
      `translate(-50%, -50%) rotate(${randomRotation}deg) scale(${randomScale})`
  })
}

const countdownTarget = new Date(2027, 6, 16, 15, 30, 0).getTime()

const countdownDays = document.querySelector('#countdown-days')
const countdownHours = document.querySelector('#countdown-hours')
const countdownMinutes = document.querySelector('#countdown-minutes')
const countdownSeconds = document.querySelector('#countdown-seconds')

if (countdownDays && countdownHours && countdownMinutes && countdownSeconds) {
  const updateCountdown = () => {
    const remaining = Math.max(countdownTarget - Date.now(), 0)

    const days = Math.floor(remaining / 86400000)
    const hours = Math.floor((remaining % 86400000) / 3600000)
    const minutes = Math.floor((remaining % 3600000) / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)

    countdownDays.textContent = String(days)
    countdownHours.textContent = String(hours).padStart(2, '0')
    countdownMinutes.textContent = String(minutes).padStart(2, '0')
    countdownSeconds.textContent = String(seconds).padStart(2, '0')
  }

  updateCountdown()
  setInterval(updateCountdown, 1000)
}