<script setup></script>
<template>
  <nav class="desktop-sidebar">
    <div class="sidebar-logo">Story App</div>

    <div class="sidebar-menu">
      <a href="#" class="sidebar-item active">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="none"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        </svg>
        <span>Beranda</span>
      </a>
      <a href="#" class="sidebar-item">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
          ></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
        <span>Upload Story</span>
      </a>
      <a href="#" class="sidebar-item">
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
          class="nav-profile-img"
          style="border: none"
        />
        <span>Profile</span>
      </a>
    </div>
  </nav>
</template>
