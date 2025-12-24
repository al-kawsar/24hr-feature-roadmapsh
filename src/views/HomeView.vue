<script setup>
import MobileMenu from "@/components/MobileMenu.vue";
</script>

<template>
  <main class="main-container">
    <!-- Mobile Header (Hanya muncul di Mobile) -->
    <header class="mobile-top-bar">
      <div class="logo">Story App</div>
      <div class="mobile-actions">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          ></path>
        </svg>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </div>
    </header>

    <!-- Stories Tray (Scroll Horizontal) -->
    <section class="stories-section">
      <div class="stories-scroll">
        <!-- My Story -->
        <div class="story-item">
          <div class="avatar-ring my-story">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
              class="story-avatar"
            />
            <div class="add-badge">+</div>
          </div>
          <span class="story-name" style="color: var(--text-secondary)"
            >Cerita Anda</span
          >
        </div>
        <!-- Friend 1 -->
        <div class="story-item">
          <div class="avatar-ring">
            <img
              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop"
              class="story-avatar"
            />
          </div>
          <span class="story-name">sarah_w</span>
        </div>
      </div>
    </section>

    <!-- Grid Content -->
    <section class="grid-container">
      <div class="story-grid">
        <!-- Cards -->
        <div class="story-card">
          <img
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=600&auto=format&fit=crop"
            class="card-img"
          />
          <div class="time-badge">2j</div>
          <div class="card-overlay">
            <img
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200"
              class="mini-avatar"
            />
            <span class="card-user">jason_art</span>
          </div>
        </div>
      </div>
    </section>
  </main>
  <MobileMenu />
</template>
