<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "@/utils/api.js";

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const error = ref(null);
const story = ref(null);
const user = ref(null);

const username = computed(() => route.params.username);
const storyId = computed(() => parseInt(route.params.storyId));

const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const storyTime = new Date(timestamp);
  const diffInHours = Math.floor((now - storyTime) / (1000 * 60 * 60));

  if (diffInHours < 1) return "Baru saja";
  if (diffInHours < 24) return `${diffInHours}j`;
  if (diffInHours < 48) return "Kemarin";
  return `${Math.floor(diffInHours / 24)}h`;
};

const fetchStoryData = async (id) => {
  if (!id) return;

  loading.value = true;
  error.value = null;

  try {
    const storyData = await api.fetchStoryById(id);
    story.value = storyData;

    if (storyData?.userId) {
      const userData = await api.fetchUserById(storyData.userId);
      user.value = userData;
    }
  } catch (err) {
    error.value = "Gagal memuat story";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const closeStory = () => {
  router.push("/");
};

watch(
  storyId,
  (newId) => {
    fetchStoryData(newId);
  },
  { immediate: true },
);

onMounted(() => {
  fetchStoryData(storyId.value);
});
</script>
<template>
  <div class="story-wrapper">
    <div class="story-container">
      <!-- Background Image (Ganti src dengan gambar pilihan Anda) -->
      <img :src="story.mediaUrl" alt="Story Content" class="story-image" />

      <!-- Gradients for Text Readability -->
      <div class="overlay-top"></div>
      <div class="overlay-bottom"></div>

      <!-- Header -->
      <div class="header">
        <!-- Progress Bars -->
        <div class="progress-bars">
          <div class="bar filled"><div class="fill"></div></div>
          <!-- Story sebelumnya (sudah dilihat) -->
          <div class="bar active"><div class="fill"></div></div>
          <!-- Story saat ini -->
          <div class="bar"><div class="fill"></div></div>
          <!-- Story selanjutnya -->
        </div>

        <!-- User Info Row -->
        <div class="user-info">
          <div class="user-left">
            <img :src="user.profilePicture" alt="Profile" class="avatar" />
            <span class="username">{{ user.username }}</span>
            <span class="time">{{ formatTimeAgo(story.timestamp) }}</span>
          </div>

          <div class="user-right" style="display: flex; gap: 16px">
            <button class="more-btn">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="19" cy="12" r="1"></circle>
                <circle cx="5" cy="12" r="1"></circle>
              </svg>
            </button>
            <button class="close-btn" @click="router.push('/')">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer / Interaction -->
      <div class="footer">
        <div class="message-input">
          <input type="text" placeholder="Kirim pesan..." />
        </div>

        <button class="icon-btn">
          <!-- Heart Icon -->
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            ></path>
          </svg>
        </button>

        <button class="icon-btn">
          <!-- Paper Plane / Share Icon -->
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
<style scoped>
/* --- 1. Base Setup (Wajib) --- */
.story-wrapper {
  /* Wrapper luar ini bertugas menengahkan konten di layar besar */
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-app); /* Warna background luar story */
}

.story-container {
  aspect-ratio: 9 / 16;
  height: 100%;
  width: auto; /* Lebar menyesuaikan tinggi & rasio */

  /* Styling Visual */
  background-color: #000;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

/* --- 2. Mobile Logic (320px, 375px, 425px) --- */
/* Di HP, kita ingin story memenuhi layar agar immersive */
@media (max-width: 767px) {
  .story-container {
    width: 100%; /* Paksa lebar penuh */
    height: 100vh; /* Paksa tinggi penuh */
    border-radius: 0;

    /* CATATAN PENTING:
       Di HP, layar fisik jarang yang pas 9:16.
       Kode di atas membuat 'object-fit' jadi fill screen.
       Jika Anda ingin STRICT 9:16 di HP (ada sisa hitam di atas/bawah),
       hapus 'width: 100%' dan biarkan 'aspect-ratio' bekerja.
    */
  }
}

/* --- 3. Tablet & Desktop Logic (768px, 1024px, 1440px, 2560px) --- */
/* Mulai dari Tablet iPad Mini (768px) ke atas, kita buat mode 'Floating Card' */
@media (min-width: 425px) {
  .story-container {
    /* Logika: "Jadilah setinggi mungkin, tapi jangan nabrak atas/bawah layar" */
    height: 90vh; /* Sisakan 5% atas dan 5% bawah */

    /* Lebar akan dihitung otomatis oleh aspect-ratio 9/16 */
    width: auto;

    /* SAFETY NET untuk Layar Super Lebar (2560px/4K) */
    /* Agar story tidak menjadi raksasa yang susah dilihat, kita batasi lebar maksimalnya */
    max-width: 600px;

    /* Kosmetik */
    border-radius: 16px;
  }
}

/* --- Background Image --- */
.story-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

/* --- Overlay Gradient (Supaya teks terbaca) --- */
.overlay-top {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 150px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), transparent);
  z-index: 2;
}

.overlay-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 150px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  z-index: 2;
}

/* --- Header Section (Progress & User Info) --- */
.header {
  position: absolute;
  top: 10px;
  left: 0;
  width: 100%;
  padding: 0 10px;
  z-index: 10;
}

/* Progress Bars */
.progress-bars {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
}

.bar {
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  flex: 1;
  border-radius: 2px;
  overflow: hidden;
}

.bar .fill {
  height: 100%;
  background: white;
  width: 0%;
}

.bar.active .fill {
  width: 100%;
  transition: width 5s linear; /* Animasi durasi story */
}

.bar.filled .fill {
  width: 100%;
}

/* User Info */
.user-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.5);
  object-fit: cover;
}

.username {
  font-weight: 600;
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.time {
  font-size: 14px;
  opacity: 0.7;
  margin-left: -2px;
}

.close-btn,
.more-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
}

/* --- Footer / Interaction Section --- */
.footer {
  position: absolute;
  bottom: 20px;
  left: 0;
  width: 100%;
  padding: 0 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 16px;
}

.message-input {
  flex: 1;
  position: relative;
}

.message-input input {
  width: 100%;
  background: rgba(0, 0, 0, 0.05); /* Sedikit transparan gelap */
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 24px;
  padding: 12px 20px;
  color: white;
  font-size: 14px;
  outline: none;
  backdrop-filter: blur(2px);
}

.message-input input::placeholder {
  color: white;
  opacity: 0.9;
  font-weight: 500;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s;
}

.icon-btn:active {
  transform: scale(0.9);
}

/* SVG Styles */
svg {
  stroke-width: 2px;
}

/* Loading and Error States */
.loading,
.error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: white;
  text-align: center;
}

.error p {
  font-size: 18px;
  margin-bottom: 20px;
}

.back-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #0056b3;
}
</style>
