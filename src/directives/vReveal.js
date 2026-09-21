const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

let observer = null

function getObserver() {
  if (observer) return observer
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed')
          observer.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
  )
  return observer
}

/**
 * v-reveal: fade/slide-in when the element scrolls into view.
 * Modifiers select the motion: v-reveal.up (default), .fade, .left, .right, .scale.
 * v-reveal="i" (or any number) staggers via --reveal-i, read by transitions.css.
 */
export default {
  mounted(el, binding) {
    const kind = Object.keys(binding.modifiers)[0] || 'up'
    el.classList.add('reveal', `reveal-${kind}`)

    if (typeof binding.value === 'number') {
      el.style.setProperty('--reveal-i', binding.value)
    }

    if (prefersReducedMotion()) {
      el.classList.add('is-revealed')
      return
    }

    getObserver().observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}
