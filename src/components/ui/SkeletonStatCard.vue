<template>
  <div class="skeleton-stat-card">
    <div class="skeleton-stat-card__glow"></div>

    <div class="skeleton-stat-card__header">
      <div class="skeleton-line skeleton-line--title"></div>
      <div class="skeleton-icon"></div>
    </div>

    <div class="skeleton-line skeleton-line--value"></div>

    <div class="skeleton-line skeleton-line--change"></div>
  </div>
</template>

<script setup lang="ts">
// Skeleton pour les stat cards du dashboard
</script>

<style scoped>
.skeleton-stat-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 1.25rem;
  position: relative;
  overflow: hidden;
}

/* Glow effect */
.skeleton-stat-card__glow {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  filter: blur(40px);
  opacity: 0.3;
}

.skeleton-stat-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
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
  width: 65px;
  height: 12px;
}

.skeleton-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
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

.skeleton-line--value {
  width: 85px;
  height: 28px;
  margin-bottom: 0.35rem;
  border-radius: 6px;
}

.skeleton-line--change {
  width: 110px;
  height: 14px;
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
  .skeleton-stat-card {
    padding: 1rem;
  }

  .skeleton-icon {
    width: 32px;
    height: 32px;
  }

  .skeleton-line--value {
    height: 24px;
  }

  .skeleton-stat-card__glow {
    width: 60px;
    height: 60px;
  }
}

@media (max-width: 480px) {
  .skeleton-stat-card {
    padding: 0.875rem;
  }

  .skeleton-icon {
    width: 30px;
    height: 30px;
    border-radius: 8px;
  }

  .skeleton-line--value {
    height: 22px;
    width: 75px;
  }

  .skeleton-line--change {
    width: 100px;
    height: 12px;
  }
}
</style>
