<template>
  <div class="skeleton-card" :class="`skeleton-card--${variant}`">
    <!-- Visual Section -->
    <div class="skeleton-card__visual">
      <div class="skeleton-pulse"></div>
    </div>

    <!-- Content Section -->
    <div class="skeleton-card__content">
      <!-- Top Row -->
      <div class="skeleton-card__top">
        <div class="skeleton-line skeleton-line--tag"></div>
        <div class="skeleton-line skeleton-line--indicator"></div>
      </div>

      <!-- Title -->
      <div class="skeleton-line skeleton-line--title"></div>

      <!-- Details -->
      <div class="skeleton-card__details">
        <div class="skeleton-line skeleton-line--detail"></div>
        <div class="skeleton-line skeleton-line--detail skeleton-line--short"></div>
      </div>

      <!-- Actions -->
      <div class="skeleton-card__actions">
        <div class="skeleton-line skeleton-line--button"></div>
        <div class="skeleton-line skeleton-line--icon"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'event' | 'artist' | 'pack'
}>(), {
  variant: 'event'
})
</script>

<style scoped>
.skeleton-card {
  display: flex;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  overflow: hidden;
  min-height: 180px;
}

/* Visual Section */
.skeleton-card__visual {
  width: 160px;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.skeleton-card--pack .skeleton-card__visual {
  width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Content Section */
.skeleton-card__content {
  flex: 1;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Top Row */
.skeleton-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.25rem;
}

/* Details */
.skeleton-card__details {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
}

/* Actions */
.skeleton-card__actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 0.75rem;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

/* Skeleton Lines */
.skeleton-line {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04) 0%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.04) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite ease-in-out;
  border-radius: 4px;
}

.skeleton-line--tag {
  width: 60px;
  height: 18px;
}

.skeleton-line--indicator {
  width: 50px;
  height: 14px;
}

.skeleton-line--title {
  width: 70%;
  height: 20px;
  margin-bottom: 0.25rem;
}

.skeleton-line--detail {
  width: 80%;
  height: 14px;
}

.skeleton-line--detail.skeleton-line--short {
  width: 50%;
}

.skeleton-line--button {
  width: 80px;
  height: 32px;
  border-radius: 6px;
}

.skeleton-line--icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
}

/* Pulse animation for visual */
.skeleton-pulse {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.02) 0%,
    rgba(255, 255, 255, 0.06) 50%,
    rgba(255, 255, 255, 0.02) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite ease-in-out;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .skeleton-card {
    min-height: 140px;
  }

  .skeleton-card__visual {
    width: 110px;
  }

  .skeleton-card--pack .skeleton-card__visual {
    width: 90px;
  }
}

@media (max-width: 480px) {
  .skeleton-card {
    flex-direction: column;
    min-height: auto;
  }

  .skeleton-card__visual {
    width: 100%;
    height: 180px;
  }

  .skeleton-card--pack .skeleton-card__visual {
    width: 100%;
    height: 100px;
  }
}
</style>

