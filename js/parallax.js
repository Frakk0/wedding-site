export function initSideBanner() {
  const banner = document.createElement('img')
  banner.src = `${import.meta.env.BASE_URL}images/SideBanner_large.png`
  banner.alt = ''
  banner.className = 'side-banner'
  banner.setAttribute('aria-hidden', 'true')
  document.body.appendChild(banner)

  const header = document.querySelector('header')

  function positionBelowHeader() {
    banner.style.top = `${header ? header.offsetHeight : 0}px`
  }

  positionBelowHeader()
  window.addEventListener('resize', positionBelowHeader)

  let ticking = false

  function updateParallax() {
    const maxScroll = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1
    )
    const progress = Math.min(window.scrollY / maxScroll, 1)
    const travelDistance = Math.max(
      banner.offsetHeight - window.innerHeight,
      0
    )

    banner.style.transform = `translateY(${-progress * travelDistance}px)`
    ticking = false
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax)
        ticking = true
      }
    },
    { passive: true }
  )

  window.addEventListener('resize', updateParallax)
  banner.addEventListener('load', updateParallax)

  updateParallax()
}
