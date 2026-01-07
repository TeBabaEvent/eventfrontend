<template>
  <div class="skeleton-list-item" :class="`skeleton-list-item--${variant}`">
    <!-- Rank/Date icon -->
    <div class="skeleton-list-item__icon"></div>

    <!-- Info section -->
    <div class="skeleton-list-item__info">
      <div class="skeleton-line skeleton-line--title"></div>
      <div class="skeleton-line skeleton-line--meta"></div>
    </div>

    <!-- End section (revenue/status) -->
    <div class="skeleton-line skeleton-line--end"></div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'top-event' | 'upcoming-event'
}>(), {
  variant: 'top-event'
})
</script>

<style scoped>
.skeleton-list-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
}

/* Icon (rank badge or date box) */
.skeleton-list-item__icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04) 0%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.04) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite ease-in-out;
  flex-shrink: 0;
}

.skeleton-list-item--upcoming-event .skeleton-list-item__icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
}

/* Info section */
.skeleton-list-item__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* Skeleton lines */
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

.skeleton-line--title {
  width: 60%;
  height: 14px;
}

.skeleton-line--meta {
  width: 45%;
  height: 11px;
}

.skeleton-line--end {
  width: 70px;
  height: 16px;
  flex-shrink: 0;
}

.skeleton-list-item--upcoming-event .skeleton-line--end {
  width: 55px;
  height: 24px;
  border-radius: 20px;
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
  .skeleton-list-item {
    padding: 0.75rem 0.875rem;
  }

  .skeleton-list-item--upcoming-event .skeleton-list-item__icon {
    width: 44px;
    height: 44px;
  }
}

@media (max-width: 480px) {
  .skeleton-list-item {
    padding: 0.75rem;
    gap: 0.75rem;
    border-radius: 10px;
  }

  .skeleton-list-item--upcoming-event .skeleton-list-item__icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
  }

  .skeleton-line--title {
    height: 13px;
  }

  .skeleton-line--meta {
    height: 10px;
  }
}
</style>
