import { supabaseClient } from './supabase.js'

const params = new URLSearchParams(window.location.search)
const inviteCode = params.get('code')

const title = document.querySelector('#title')
const subtitle = document.querySelector('#subtitle')
const form = document.querySelector('#rsvp-form')
const guestCount = document.querySelector('#guest-count')
const status = document.querySelector('#status')
const attendingSelect = document.querySelector('#attending')
const guestCountInput = document.querySelector('#guest-count')
const dietaryNotesInput = document.querySelector('#dietary-notes')
const customMessage = document.querySelector('#custom-message')

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

attendingSelect.addEventListener('change', updateAttendanceFields)


async function loadInvitation() {
  if (!inviteCode) {
    title.textContent = 'Invalid invitation'
    subtitle.textContent = 'No invitation code was provided.'
    return
  }

  const { data, error } = await supabaseClient.functions.invoke(
    'get-invitation',
    {
      body: {
        invite_code: inviteCode,
      },
    }
  )

  if (error) {
    console.error(error)
    title.textContent = 'Invitation not found'
    subtitle.textContent = 'Please check your invitation link.'
    return
  }

  if (data.custom_message) {
    customMessage.textContent = data.custom_message
    customMessage.hidden = false
    } else {
    customMessage.textContent = `Test default message`
    customMessage.hidden = false
    }


  title.textContent = `Welcome, ${data.display_name}`
  subtitle.textContent =
    `Your invitation is for up to ${data.max_guests} guest${data.max_guests === 1 ? '' : 's'}.`

  guestCount.max = data.max_guests
  guestCount.value = Math.min(1, data.max_guests)

  form.hidden = false

  if (data.rsvp) {
  document.querySelector('#attending').value =
    data.rsvp.attending ? 'yes' : 'no'

    updateAttendanceFields()

  document.querySelector('#guest-count').value =
    data.rsvp.guest_count

  document.querySelector('#dietary-notes').value =
    data.rsvp.dietary_notes ?? ''

  document.querySelector('#message').value =
    data.rsvp.message ?? ''

  status.textContent =
    'You have already responded. You can update your RSVP below.'
}
}

loadInvitation()

form.addEventListener('submit', async (event) => {
  event.preventDefault()

  status.textContent = 'Saving...'

  const attendingValue =
    document.querySelector('#attending').value

  const attending =
    attendingValue === 'yes'

  const guestCountValue =
    Number(document.querySelector('#guest-count').value)

  const dietaryNotes =
    document.querySelector('#dietary-notes').value.trim()

  const message =
    document.querySelector('#message').value.trim()

  const { data, error } =
    await supabaseClient.functions.invoke(
      'submit-rsvp',
      {
        body: {
          invite_code: inviteCode,
          attending,
          guest_count: guestCountValue,
          dietary_notes: dietaryNotes,
          message,
        },
      },
    )

  if (error) {
    console.error('RSVP error:', error)

    if (error.context) {
      try {
        const response =
          await error.context.json()

        console.error(
          'Function response:',
          response,
        )

        status.textContent =
          response.error || 'Could not save RSVP.'

        return
      } catch {
        // ignore parsing error
      }
    }

    status.textContent =
      'Could not save RSVP.'

    return
  }

  console.log('RSVP saved:', data)

  status.textContent =
    attending
      ? 'Thank you! Your attendance has been confirmed.'
      : 'Thank you. Your response has been saved.'
})