const APPEAR_DELAY_MS = 5000

export function initBee() {
  const wrap = document.createElement('div')
  wrap.className = 'bee-wrap'
  wrap.style.visibility = 'hidden'

  const bee = document.createElement('img')
  bee.src = `${import.meta.env.BASE_URL}images/Bee_small.png`
  bee.alt = ''
  bee.className = 'bee'
  bee.setAttribute('aria-hidden', 'true')

  const buzz = document.createElement('div')
  buzz.className = 'bee-buzz'
  buzz.textContent = 'bzz bzz'
  buzz.setAttribute('aria-hidden', 'true')

  wrap.appendChild(bee)
  wrap.appendChild(buzz)
  document.body.appendChild(wrap)

  const margin = 40
  let current
  let flightTimeout
  let buzzTimeout

  function randomPoint() {
    return {
      x: margin + Math.random() * (window.innerWidth - margin * 2),
      y: margin + Math.random() * (window.innerHeight - margin * 2),
    }
  }

  function flyToRandomPoint(fast = false) {
    const next = randomPoint()
    const distance = Math.hypot(next.x - current.x, next.y - current.y)

    const duration = fast
      ? Math.min(Math.max(distance / 80, 1.5), 4)
      : Math.min(Math.max(distance / 25, 5), 10)

    wrap.style.transitionDuration = `${duration}s`
    bee.style.setProperty('--bee-dir', next.x >= current.x ? 1 : -1)
    wrap.style.left = `${next.x}px`
    wrap.style.top = `${next.y}px`

    current = next

    flightTimeout = setTimeout(
      () => flyToRandomPoint(false),
      duration * 1000 + 800 + Math.random() * 1200
    )
  }

  function showBuzz() {
    buzz.classList.add('visible')

    clearTimeout(buzzTimeout)
    buzzTimeout = setTimeout(() => {
      buzz.classList.remove('visible')
    }, 1200)
  }

  bee.addEventListener('click', () => {
    showBuzz()

    if (navigator.vibrate) {
      navigator.vibrate([40, 40, 40])
    }

    clearTimeout(flightTimeout)
    flyToRandomPoint(true)
  })

  setTimeout(() => {
    // Start just off-screen on the right, then fly in to a random point.
    current = {
      x: window.innerWidth + 60,
      y: margin + Math.random() * (window.innerHeight - margin * 2),
    }

    wrap.style.transitionDuration = '0s'
    wrap.style.left = `${current.x}px`
    wrap.style.top = `${current.y}px`
    bee.style.setProperty('--bee-dir', -1)
    wrap.style.visibility = 'visible'

    // Wait a frame so the off-screen starting position is painted
    // before animating in, otherwise the browser skips straight to it.
    requestAnimationFrame(() => {
      requestAnimationFrame(flyToRandomPoint)
    })
  }, APPEAR_DELAY_MS)
}
