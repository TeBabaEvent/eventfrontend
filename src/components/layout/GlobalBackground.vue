<template>
  <div ref="backgroundRef" class="global-background">
    <!-- Base gradient -->
    <div class="global-bg__base"></div>

    <!-- Aurora/Gradient Mesh - Animated with scroll -->
    <div ref="auroraRef" class="global-bg__aurora">
      <div class="global-bg__aurora-layer global-bg__aurora-layer--1"></div>
      <div class="global-bg__aurora-layer global-bg__aurora-layer--2"></div>
      <div class="global-bg__aurora-layer global-bg__aurora-layer--3"></div>
    </div>

    <!-- Morphing Blobs - Parallax depth -->
    <div class="global-bg__blobs">
      <div ref="blob1Ref" class="global-bg__blob global-bg__blob--1"></div>
      <div ref="blob2Ref" class="global-bg__blob global-bg__blob--2"></div>
      <div ref="blob3Ref" class="global-bg__blob global-bg__blob--3"></div>
      <div ref="blob4Ref" class="global-bg__blob global-bg__blob--4"></div>
    </div>

    <!-- Light Beams - Scroll reactive -->
    <div ref="beamsRef" class="global-bg__beams">
      <div class="global-bg__beam global-bg__beam--1"></div>
      <div class="global-bg__beam global-bg__beam--2"></div>
      <div class="global-bg__beam global-bg__beam--3"></div>
    </div>

    <!-- Floating Particles (fewer = more elegant) -->
    <div ref="particlesRef" class="global-bg__particles">
      <div v-for="n in 8" :key="n" class="global-bg__particle"></div>
    </div>

    <!-- Noise Texture Overlay -->
    <div class="global-bg__noise"></div>

    <!-- Subtle Grid - Perspective shift -->
    <div ref="gridRef" class="global-bg__grid"></div>

    <!-- Glow orbs that follow scroll -->
    <div ref="glowRef" class="global-bg__glow"></div>

    <!-- Vignette -->
    <div class="global-bg__vignette"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Refs
const backgroundRef = ref<HTMLElement | null>(null)
const auroraRef = ref<HTMLElement | null>(null)
const blob1Ref = ref<HTMLElement | null>(null)
const blob2Ref = ref<HTMLElement | null>(null)
const blob3Ref = ref<HTMLElement | null>(null)
const blob4Ref = ref<HTMLElement | null>(null)
const beamsRef = ref<HTMLElement | null>(null)
const particlesRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)
const glowRef = ref<HTMLElement | null>(null)

let gsapContext: gsap.Context | null = null

// ═══════════════════════════════════════════════════════════════
// SUBTLE PARALLAX EFFECTS
// ═══════════════════════════════════════════════════════════════

const initScrollEffects = () => {
  // Use document.documentElement as the scroll container
  const scrollContainer = document.documentElement

  gsapContext = gsap.context(() => {
    // ─────────────────────────────────────────────────────────────
    // BLOBS - Subtle parallax movement
    // ─────────────────────────────────────────────────────────────
    gsap.to(blob1Ref.value, {
      y: '-20vh',
      ease: 'none',
      scrollTrigger: {
        trigger: scrollContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 2
      }
    })

    gsap.to(blob2Ref.value, {
      y: '-30vh',
      ease: 'none',
      scrollTrigger: {
        trigger: scrollContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 3
      }
    })

    gsap.to(blob3Ref.value, {
      y: '-40vh',
      ease: 'none',
      scrollTrigger: {
        trigger: scrollContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 4
      }
    })

    gsap.to(blob4Ref.value, {
      y: '-50vh',
      ease: 'none',
      scrollTrigger: {
        trigger: scrollContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 5
      }
    })

    // ─────────────────────────────────────────────────────────────
    // AURORA - Gentle drift
    // ─────────────────────────────────────────────────────────────
    const auroraLayers = auroraRef.value?.querySelectorAll('.global-bg__aurora-layer')
    if (auroraLayers) {
      auroraLayers.forEach((layer, index) => {
        gsap.to(layer, {
          y: `${(index + 1) * -15}vh`,
          ease: 'none',
          scrollTrigger: {
            trigger: scrollContainer,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 2 + index
          }
        })
      })
    }

    // ─────────────────────────────────────────────────────────────
    // PARTICLES - Floating upward
    // ─────────────────────────────────────────────────────────────
    const particles = particlesRef.value?.querySelectorAll('.global-bg__particle')
    if (particles) {
      particles.forEach((particle, index) => {
        gsap.set(particle, {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight * 2,
          scale: 0.3 + Math.random() * 0.7,
          opacity: 0.2 + Math.random() * 0.3
        })

        gsap.to(particle, {
          y: `-=${50 + (index * 20)}vh`,
          ease: 'none',
          scrollTrigger: {
            trigger: scrollContainer,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1 + (index * 0.2)
          }
        })
      })
    }

    // ─────────────────────────────────────────────────────────────
    // GLOW - Follow scroll
    // ─────────────────────────────────────────────────────────────
    gsap.to(glowRef.value, {
      y: '150vh',
      ease: 'none',
      scrollTrigger: {
        trigger: scrollContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 2
      }
    })

    // Grid - subtle shift (keeping)
    const eventsSection = document.querySelector('#events')
    if (eventsSection) {
      gsap.to(glowRef.value, {
        opacity: 0.4,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: eventsSection,
          start: 'top 60%',
          end: 'top 30%',
          toggleActions: 'play reverse play reverse'
        }
      })

      // Blob pulse on events
      gsap.to(blob1Ref.value, {
        opacity: 0.5,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: eventsSection,
          start: 'top 70%',
          toggleActions: 'play reverse play reverse'
        }
      })
    }

    // Team section - Different glow position
    const teamSection = document.querySelector('#team')
    if (teamSection) {
      gsap.to(glowRef.value, {
        x: '-10vw',
        opacity: 0.4,
        scale: 1.8,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: teamSection,
          start: 'top 60%',
          end: 'top 30%',
          toggleActions: 'play reverse play reverse'
        }
      })

      // Blob 2 pulse on team
      gsap.to(blob2Ref.value, {
        opacity: 0.45,
        scale: 1.3,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: teamSection,
          start: 'top 70%',
          toggleActions: 'play reverse play reverse'
        }
      })
    }

    // Footer/Contact section - Warm glow
    const footerSection = document.querySelector('#contact')
    if (footerSection) {
      gsap.to(glowRef.value, {
        opacity: 0.6,
        scale: 2.2,
        duration: 1.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: footerSection,
          start: 'top 70%',
          toggleActions: 'play reverse play reverse'
        }
      })
    }

  }, backgroundRef.value || undefined)
}

onMounted(() => {
  // Initialize immediately
  initScrollEffects()
})

onUnmounted(() => {
  if (gsapContext) {
    gsapContext.revert()
    gsapContext = null
  }
})
</script>

<style scoped>
/* ========================================
   GLOBAL BACKGROUND - Continuous Site-wide
   ======================================== */

.global-background {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  background: #030303;
}

/* Base Layer - Deep Dark */
.global-bg__base {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 120% 80% at 50% 120%, rgba(10, 0, 5, 1) 0%, transparent 70%),
    radial-gradient(ellipse 80% 50% at 80% 0%, rgba(15, 5, 10, 1) 0%, transparent 50%),
    linear-gradient(180deg, #030303 0%, #080408 50%, #050205 100%);
}

/* Aurora Layers - Animated Gradient Mesh with fade-in */
.global-bg__aurora {
  position: absolute;
  inset: 0;
  overflow: hidden;
  opacity: 0;
  animation: aurora-fade-in 1.5s ease-out 0.3s forwards;
}

.global-bg__aurora-layer {
  position: absolute;
  width: 150%;
  height: 150%;
  filter: blur(80px);
  will-change: transform;
}

.global-bg__aurora-layer--1 {
  top: -30%;
  right: -20%;
  background:
    radial-gradient(ellipse 60% 40% at 70% 30%, rgba(220, 20, 60, 0.25) 0%, transparent 60%),
    radial-gradient(ellipse 40% 30% at 50% 60%, rgba(180, 20, 80, 0.15) 0%, transparent 50%);
  animation: aurora-drift-1 20s ease-in-out infinite;
}

.global-bg__aurora-layer--2 {
  bottom: -40%;
  left: -30%;
  background:
    radial-gradient(ellipse 50% 50% at 30% 70%, rgba(220, 20, 60, 0.2) 0%, transparent 60%),
    radial-gradient(ellipse 35% 25% at 60% 40%, rgba(150, 10, 50, 0.12) 0%, transparent 50%);
  animation: aurora-drift-2 25s ease-in-out infinite;
}

.global-bg__aurora-layer--3 {
  top: 20%;
  left: 10%;
  background:
    radial-gradient(ellipse 30% 40% at 40% 50%, rgba(255, 50, 100, 0.08) 0%, transparent 60%);
  animation: aurora-drift-3 18s ease-in-out infinite;
}

@keyframes aurora-drift-1 {
  0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
  25% { transform: translate(5%, -3%) rotate(2deg) scale(1.05); }
  50% { transform: translate(-3%, 5%) rotate(-1deg) scale(0.98); }
  75% { transform: translate(2%, 2%) rotate(1deg) scale(1.02); }
}

@keyframes aurora-drift-2 {
  0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
  33% { transform: translate(-4%, 3%) rotate(-2deg) scale(1.03); }
  66% { transform: translate(3%, -2%) rotate(1deg) scale(0.97); }
}

@keyframes aurora-drift-3 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
  50% { transform: translate(10%, -5%) scale(1.1); opacity: 1; }
}

/* Fade-in animation for smooth entrance */
@keyframes aurora-fade-in {
  0% { opacity: 0; }
  100% { opacity: 0.7; }
}

@keyframes blobs-fade-in {
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes glow-fade-in {
  0% { opacity: 0; transform: scale(0.5); }
  100% { opacity: 1; transform: scale(1); }
}

/* Morphing Blobs - Positioned across entire page height */
.global-bg__blobs {
  position: absolute;
  inset: 0;
  overflow: hidden;
  opacity: 0;
  animation: blobs-fade-in 2s ease-out 0.5s forwards;
}

.global-bg__blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  mix-blend-mode: screen;
  will-change: transform, border-radius;
}

/* Blob 1 - Top right (Hero area) */
.global-bg__blob--1 {
  width: 500px;
  height: 500px;
  top: 5vh;
  right: 5%;
  background: radial-gradient(circle, rgba(220, 20, 60, 0.35) 0%, rgba(180, 10, 50, 0.15) 50%, transparent 70%);
  animation: blob-morph-1 12s ease-in-out infinite;
}

/* Blob 2 - Middle left (Events area) */
.global-bg__blob--2 {
  width: 400px;
  height: 400px;
  top: 80vh;
  left: -5%;
  background: radial-gradient(circle, rgba(200, 30, 70, 0.25) 0%, rgba(150, 20, 60, 0.1) 50%, transparent 70%);
  animation: blob-morph-2 15s ease-in-out infinite;
}

/* Blob 3 - Center (Team area) */
.global-bg__blob--3 {
  width: 350px;
  height: 350px;
  top: 150vh;
  right: 10%;
  background: radial-gradient(circle, rgba(255, 60, 100, 0.15) 0%, transparent 60%);
  animation: blob-morph-3 10s ease-in-out infinite;
}

/* Blob 4 - Bottom (Footer area) */
.global-bg__blob--4 {
  width: 300px;
  height: 300px;
  top: 220vh;
  left: 15%;
  background: radial-gradient(circle, rgba(220, 20, 60, 0.2) 0%, transparent 60%);
  animation: blob-morph-4 18s ease-in-out infinite;
}

@keyframes blob-morph-1 {
  0%, 100% {
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    transform: translate(0, 0) scale(1);
  }
  25% {
    border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
    transform: translate(3%, -5%) scale(1.05);
  }
  50% {
    border-radius: 50% 60% 30% 60% / 30% 40% 70% 50%;
    transform: translate(-2%, 3%) scale(0.95);
  }
  75% {
    border-radius: 40% 30% 60% 50% / 60% 50% 40% 30%;
    transform: translate(4%, 2%) scale(1.02);
  }
}

@keyframes blob-morph-2 {
  0%, 100% {
    border-radius: 40% 60% 60% 40% / 70% 30% 60% 40%;
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    border-radius: 60% 40% 30% 70% / 40% 60% 40% 60%;
    transform: translate(5%, -3%) rotate(10deg);
  }
}

@keyframes blob-morph-3 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translate(-10%, 10%) scale(1.2);
    opacity: 1;
  }
}

@keyframes blob-morph-4 {
  0%, 100% {
    border-radius: 50% 50% 50% 50%;
    transform: translate(0, 0) scale(1);
  }
  33% {
    border-radius: 60% 40% 50% 50% / 50% 60% 40% 50%;
    transform: translate(3%, -2%) scale(1.08);
  }
  66% {
    border-radius: 40% 60% 50% 50% / 60% 40% 60% 40%;
    transform: translate(-2%, 3%) scale(0.95);
  }
}

/* Light Beams */
.global-bg__beams {
  position: absolute;
  inset: 0;
  overflow: hidden;
  opacity: 0.5;
}

.global-bg__beam {
  position: absolute;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(220, 20, 60, 0.02) 10%,
    rgba(220, 20, 60, 0.06) 50%,
    rgba(220, 20, 60, 0.02) 90%,
    transparent 100%
  );
  filter: blur(2px);
  will-change: transform, opacity;
}

.global-bg__beam--1 {
  width: 3px;
  height: 150%;
  top: -25%;
  right: 20%;
  transform: rotate(12deg);
  animation: beam-pulse 8s ease-in-out infinite;
}

.global-bg__beam--2 {
  width: 2px;
  height: 130%;
  top: -15%;
  right: 40%;
  transform: rotate(-8deg);
  animation: beam-pulse 10s ease-in-out infinite 2s;
}

.global-bg__beam--3 {
  width: 1px;
  height: 180%;
  top: -40%;
  left: 30%;
  transform: rotate(20deg);
  animation: beam-pulse 12s ease-in-out infinite 4s;
  opacity: 0.3;
}

@keyframes beam-pulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.7; }
}

/* ═══════════════════════════════════════════════════════════
   FLOATING PARTICLES - Awwwards Magic ✨
   ═══════════════════════════════════════════════════════════ */
.global-bg__particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.global-bg__particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: radial-gradient(circle, rgba(220, 20, 60, 0.8) 0%, rgba(255, 100, 150, 0.4) 50%, transparent 70%);
  border-radius: 50%;
  filter: blur(1px);
  will-change: transform, opacity;
  animation: particle-glow 3s ease-in-out infinite;
}

.global-bg__particle:nth-child(odd) {
  animation-delay: -1.5s;
  width: 3px;
  height: 3px;
}

.global-bg__particle:nth-child(3n) {
  width: 6px;
  height: 6px;
  filter: blur(2px);
}

.global-bg__particle:nth-child(5n) {
  background: radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, rgba(220, 20, 60, 0.3) 50%, transparent 70%);
}

@keyframes particle-glow {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.2);
  }
}

/* ═══════════════════════════════════════════════════════════
   GLOW ORB - Scroll-following light
   ═══════════════════════════════════════════════════════════ */
.global-bg__glow {
  position: absolute;
  width: 600px;
  height: 600px;
  top: 20%;
  left: 30%;
  opacity: 0;
  animation: glow-fade-in 2.5s ease-out 0.8s forwards;
  background: radial-gradient(
    circle,
    rgba(220, 20, 60, 0.15) 0%,
    rgba(180, 20, 80, 0.08) 30%,
    rgba(150, 10, 60, 0.03) 60%,
    transparent 70%
  );
  border-radius: 50%;
  filter: blur(80px);
  will-change: transform, opacity;
  pointer-events: none;
}

/* Noise Texture */
.global-bg__noise {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.035;
  mix-blend-mode: overlay;
  pointer-events: none;
}

/* Subtle Grid - covers full page */
.global-bg__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
  background-size: 80px 80px;
  opacity: 0.6;
}

/* Vignette Effect */
.global-bg__vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 70% 60% at 50% 50%,
    transparent 30%,
    rgba(0, 0, 0, 0.4) 100%
  );
  pointer-events: none;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .global-bg__blob--1 {
    width: 350px;
    height: 350px;
  }

  .global-bg__blob--2 {
    width: 280px;
    height: 280px;
  }

  .global-bg__blob--3 {
    width: 250px;
    height: 250px;
  }

  .global-bg__blob--4 {
    width: 200px;
    height: 200px;
  }

  .global-bg__beams {
    opacity: 0.2;
  }

  .global-bg__glow {
    width: 400px;
    height: 400px;
  }

  .global-bg__particle:nth-child(n+15) {
    display: none;
  }
}

@media (max-width: 768px) {
  .global-bg__blob--1 {
    width: 300px;
    height: 300px;
    top: 0;
    right: -100px;
    opacity: 0.65;
    filter: blur(80px);
  }

  .global-bg__blob--2 {
    width: 250px;
    height: 250px;
    top: 60vh;
    left: -100px;
    opacity: 0.55;
    filter: blur(70px);
  }

  .global-bg__blob--3 {
    width: 200px;
    height: 200px;
    top: 120vh;
    right: -60px;
    opacity: 0.45;
    filter: blur(60px);
  }

  .global-bg__blob--4 {
    width: 180px;
    height: 180px;
    top: 180vh;
    left: -50px;
    opacity: 0.4;
  }

  .global-bg__aurora {
    opacity: 0.55;
  }

  .global-bg__beams {
    display: block;
    opacity: 0.1;
  }

  .global-bg__grid {
    opacity: 0.3;
    background-size: 50px 50px;
  }

  .global-bg__glow {
    width: 300px;
    height: 300px;
    filter: blur(60px);
  }

  .global-bg__particles {
    opacity: 0.6;
  }

  .global-bg__particle:nth-child(n+10) {
    display: none;
  }

  .global-bg__vignette {
    background: radial-gradient(
      ellipse 85% 75% at 50% 50%,
      transparent 0%,
      rgba(0, 0, 0, 0.6) 100%
    );
  }
}

@media (max-width: 480px) {
  .global-bg__blob--3,
  .global-bg__blob--4 {
    display: none;
  }

  .global-bg__particles {
    display: none;
  }

  .global-bg__glow {
    width: 200px;
    height: 200px;
  }

  .global-bg__beam--3 {
    display: none;
  }
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .global-bg__aurora-layer,
  .global-bg__blob,
  .global-bg__beam,
  .global-bg__particle {
    animation: none !important;
  }
}
</style>

