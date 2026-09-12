const APPEAR_DELAY_MS = 5000

export function initBee() {
  const bee = document.createElement('img')
  bee.src = `${import.meta.env.BASE_URL}images/Bee.png`
  bee.alt = ''
  bee.className = 'bee'
  bee.setAttribute('aria-hidden', 'true')
  bee.style.visibility = 'hidden'
  document.body.appendChild(bee)

  const margin = 40

  function randomPoint() {
    return {
      x: margin + Math.random() * (window.innerWidth - margin * 2),
      y: margin + Math.random() * (window.innerHeight - margin * 2),
    }
  }

  let current

  function flyToRandomPoint() {
    const next = randomPoint()
    const distance = Math.hypot(next.x - current.x, next.y - current.y)
    const duration = Math.min(Math.max(distance / 80, 1.5), 4)

    bee.style.transitionDuration = `${duration}s`
    bee.style.setProperty('--bee-dir', next.x >= current.x ? 1 : -1)
    bee.style.left = `${next.x}px`
    bee.style.top = `${next.y}px`

    current = next

    setTimeout(
      flyToRandomPoint,
      duration * 1000 + 800 + Math.random() * 1200
    )
  }

  setTimeout(() => {
    // Start just off-screen on the right, then fly in to a random point.
    current = {
      x: window.innerWidth + 60,
      y: margin + Math.random() * (window.innerHeight - margin * 2),
    }

    bee.style.transitionDuration = '0s'
    bee.style.left = `${current.x}px`
    bee.style.top = `${current.y}px`
    bee.style.setProperty('--bee-dir', -1)
    bee.style.visibility = 'visible'

    // Wait a frame so the off-screen starting position is painted
    // before animating in, otherwise the browser skips straight to it.
    requestAnimationFrame(() => {
      requestAnimationFrame(flyToRandomPoint)
    })
  }, APPEAR_DELAY_MS)
}
