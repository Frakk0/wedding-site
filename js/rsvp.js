import { supabaseClient } from './supabase.js'
import {
  initLanguage,
  setLanguage,
  t,
  getLanguage,
} from './i18n.js'
import { initBee } from './bee.js'
import { initSideBanner } from './parallax.js'

await initLanguage()

initBee()
initSideBanner()

const params = new URLSearchParams(window.location.search)
let inviteCode = params.get('code')

const title = document.querySelector('#title')
const subtitle = document.querySelector('#subtitle')
const codeForm = document.querySelector('#code-form')
const codeInput = document.querySelector('#code-input')
const form = document.querySelector('#rsvp-form')
const status = document.querySelector('#status')
const attendingSelect = document.querySelector('#attending')
const guestCountInput = document.querySelector('#guest-count')
const dietaryNotesInput = document.querySelector('#dietary-notes')
const messageInput = document.querySelector('#message')
const customMessage = document.querySelector('#custom-message')
const languageSelector = document.querySelector('#language-selector')

let invitationData = null

// Make the selector reflect the currently active language
if (languageSelector) {
  languageSelector.value = getLanguage()

  languageSelector.addEventListener('change', async (event) => {
    await setLanguage(event.target.value)

    // Re-render dynamic text in the newly selected language
    renderInvitation()
  })
}

function updateAttendanceFields() {
  const attending = attendingSelect.value === 'yes'

  guestCountInput.disabled = !attending
  dietaryNotesInput.disabled = !attending

  if (!attending) {
    guestCountInput.value = 0
    dietaryNotesInput.value = ''
  } else if (Number(guestCountInput.value) === 0) {
    guestCountInput.value = 1
  }
}

attendingSelect.addEventListener(
  'change',
  updateAttendanceFields
)

function renderInvitation() {
  if (!invitationData) {
    return
  }

  title.textContent = t(
    'rsvp.welcome',
    { name: invitationData.display_name }
  )

  subtitle.textContent = t(
    'rsvp.guestLimit',
    { count: invitationData.max_guests }
  )

  if (invitationData.custom_message) {
    customMessage.textContent =
      invitationData.custom_message
  } else {
    customMessage.textContent =
      t('rsvp.defaultCustomMessage')
  }

  customMessage.hidden = false

  if (invitationData.rsvp) {
    status.textContent =
      t('rsvp.alreadyResponded')
  }
}

async function loadInvitation() {
  if (!inviteCode) {
    title.textContent =
      t('rsvp.invalidInvitation')

    subtitle.textContent =
      t('rsvp.missingCode')

    codeForm.hidden = false

    return
  }

  const { data, error } =
    await supabaseClient.functions.invoke(
      'get-invitation',
      {
        body: {
          invite_code: inviteCode,
        },
      }
    )

  if (error) {
    console.error(
      'Invitation loading error:',
      error
    )

    title.textContent =
      t('rsvp.notFound')

    subtitle.textContent =
      t('rsvp.checkLink')

    codeForm.hidden = false

    return
  }

  codeForm.hidden = true

  invitationData = data

  guestCountInput.max =
    data.max_guests

  guestCountInput.value =
    Math.min(1, data.max_guests)

  if (data.rsvp) {
    attendingSelect.value =
      data.rsvp.attending ? 'yes' : 'no'

    guestCountInput.value =
      data.rsvp.guest_count

    dietaryNotesInput.value =
      data.rsvp.dietary_notes ?? ''

    messageInput.value =
      data.rsvp.message ?? ''
  }

  updateAttendanceFields()
  renderInvitation()

  form.hidden = false
}

codeForm.addEventListener(
  'submit',
  async (event) => {
    event.preventDefault()

    const enteredCode = codeInput.value.trim()

    if (!enteredCode) {
      return
    }

    inviteCode = enteredCode

    const url = new URL(window.location)
    url.searchParams.set('code', inviteCode)
    window.history.replaceState({}, '', url)

    title.textContent =
      t('rsvp.loading')

    subtitle.textContent = ''

    await loadInvitation()
  }
)

form.addEventListener(
  'submit',
  async (event) => {
    event.preventDefault()

    status.textContent =
      t('rsvp.saving')

    const attending =
      attendingSelect.value === 'yes'

    const guestCount =
      Number(guestCountInput.value)

    const dietaryNotes =
      dietaryNotesInput.value.trim()

    const message =
      messageInput.value.trim()

    const { data, error } =
      await supabaseClient.functions.invoke(
        'submit-rsvp',
        {
          body: {
            invite_code: inviteCode,
            attending,
            guest_count: guestCount,
            dietary_notes: dietaryNotes,
            message,
          },
        }
      )

    if (error) {
      console.error(
        'RSVP error:',
        error
      )

      if (error.context) {
        try {
          const response =
            await error.context.json()

          console.error(
            'Function response:',
            response
          )

          status.textContent =
            response.error ||
            t('rsvp.savedError')

          return
        } catch {
          // Could not parse error response
        }
      }

      status.textContent =
        t('rsvp.savedError')

      return
    }

    console.log(
      'RSVP saved:',
      data
    )

    status.textContent =
      attending
        ? t('rsvp.savedYes')
        : t('rsvp.savedNo')
  }
)

loadInvitation()