declare module 'aos' {
  interface AOSOptions {
    duration?: number
    easing?: string
    once?: boolean
    offset?: number
    delay?: number
    anchor?: string
    anchorPlacement?: string
    disable?: boolean | string
    startEvent?: string
    initClassName?: string
    animatedClassName?: string
    useClassNames?: boolean
    disableMutationObserver?: boolean
    throttleDelay?: number
    debounceDelay?: number
  }

  interface AOS {
    init(options?: AOSOptions): void
    refresh(): void
    refreshHard(): void
  }

  const AOS: AOS
  export default AOS
}
