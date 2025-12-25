<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "@/utils/api.js";
import { formatTimeAgo } from "@/utils/formatters.js";

const route = useRoute();
const router = useRouter();

// State
const loading = ref(true);
const error = ref(null);
const user = ref(null);
const userStories = ref([]);
const currentIndex = ref(0);
const progress = ref(0);
const isPaused = ref(false);
const viewedStories = ref(new Set()); // Track viewed stories in this session

// Constants
const STORY_DURATION = 5000; // 5 seconds per story
const TICK_INTERVAL = 50; // Update every 50ms for smooth animation

// Route params
const storyId = computed(() => route.params.storyId);
const username = computed(() => route.params.username);

// Current story from valid stories
const currentStory = computed(
  () => userStories.value[currentIndex.value] || null,
);

// Check if a story index has been viewed (for progress bar fill)
const isViewed = (index) => {
  if (index < currentIndex.value) return true;
  const story = userStories.value[index];
  return story && viewedStories.value.has(story.id);
};

// Timer
let timer = null;

const startTimer = () => {
  stopTimer();
  progress.value = 0;

  timer = setInterval(() => {
    if (!isPaused.value) {
      progress.value += 100 / (STORY_DURATION / TICK_INTERVAL);
      if (progress.value >= 100) {
        goToNext();
      }
    }
  }, TICK_INTERVAL);
};

const stopTimer = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

const resetTimer = () => {
  progress.value = 0;
  startTimer();
};

// Mark current story as viewed
const markAsViewed = () => {
  if (currentStory.value) {
    viewedStories.value.add(currentStory.value.id);
  }
};

// Navigation
const goToNext = () => {
  markAsViewed();
  if (currentIndex.value < userStories.value.length - 1) {
    const newIndex = currentIndex.value + 1;
    const newStoryId = userStories.value[newIndex].id;
    router.replace({ path: `/stories/${username.value}/${newStoryId}` });
  } else {
    closeStory();
  }
};

const goToPrev = () => {
  if (progress.value > 15) {
    // If progress > 15%, restart current story
    resetTimer();
  } else if (currentIndex.value > 0) {
    const newIndex = currentIndex.value - 1;
    const newStoryId = userStories.value[newIndex].id;
    router.replace({ path: `/stories/${username.value}/${newStoryId}` });
  }
};

const goToStory = (index) => {
  if (
    index >= 0 &&
    index < userStories.value.length &&
    index !== currentIndex.value
  ) {
    // Mark all stories before target as viewed
    for (let i = 0; i < index; i++) {
      const story = userStories.value[i];
      if (story) viewedStories.value.add(story.id);
    }
    const newStoryId = userStories.value[index].id;
    router.replace({ path: `/stories/${username.value}/${newStoryId}` });
  }
};

// Tap handling
const handleTap = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const width = rect.width;

  if (x < width / 3) {
    goToPrev();
  } else {
    goToNext();
  }
};

// Pause/Resume on hold
const handlePauseStart = () => {
  isPaused.value = true;
};

const handlePauseEnd = () => {
  isPaused.value = false;
};

// Close story
const closeStory = () => {
  stopTimer();
  router.push("/");
};

// Fetch data
const fetchData = async () => {
  loading.value = true;
  error.value = null;

  try {
    // First fetch the clicked story to get userId
    const storyData = await api.fetchStoryById(storyId.value);

    if (!storyData?.userId) {
      throw new Error("Story not found");
    }

    // Check if clicked story is still valid (not expired)
    // if (!isStoryValid(storyData.timestamp)) {
    //   error.value = "Story ini sudah kadaluarsa (lebih dari 24 jam)";
    //   return;
    // }

    // Fetch user data and all stories by this user in parallel
    const [userData, stories] = await Promise.all([
      api.fetchUserById(storyData.userId),
      api.fetchStoriesByUserId(storyData.userId),
    ]);

    user.value = userData;
    userStories.value = stories;

    // Ensure username in URL matches fetched username
    if (user.value.username && user.value.username !== username.value) {
      // If the username in the URL doesn't match the fetched user's username, redirect to the canonical URL
      router.replace({ path: `/stories/${user.value.username}/${storyId.value}` });
      // Important: After a redirect, stop further processing in this execution path
      loading.value = false; // Ensure loading state is reset if we exit early
      return;
    }

    // Find index of clicked story in valid stories
    const index = stories.findIndex((s) => s.id === storyId.value);

    if (index === -1) {
      // Story not found in valid list, start from first
      currentIndex.value = 0;
    } else {
      currentIndex.value = index;
      // Mark all stories before this one as viewed (they were skipped)
      for (let i = 0; i < index; i++) {
        viewedStories.value.add(stories[i].id);
      }
    }

    // Start timer
    startTimer();
  } catch (err) {
    error.value = "Gagal memuat story";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Keyboard navigation
const handleKeydown = (e) => {
  if (e.key === "ArrowRight") goToNext();
  else if (e.key === "ArrowLeft") goToPrev();
  else if (e.key === "Escape") closeStory();
};

onMounted(() => {
  fetchData();
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  stopTimer();
  window.removeEventListener("keydown", handleKeydown);
});

// Watch for route changes
watch(storyId, (newStoryId) => {
  // if stories are not loaded yet, fetch them
  if (!userStories.value || userStories.value.length === 0) {
    fetchData();
    return;
  }

  const index = userStories.value.findIndex((s) => s.id === newStoryId);

  if (index !== -1) {
    // if story is in the current list, just switch to it
    // The condition `currentIndex.value !== index` was removed as it could prevent the story from advancing.
    currentIndex.value = index;
    resetTimer();
  } else {
    // if story is not in the list (e.g. new user), fetch data
    fetchData();
  }
});
</script>

<template>
  <div class="story-wrapper">
    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <span>Loading story...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button class="back-btn" @click="closeStory">Kembali</button>
    </div>

    <!-- Story Content -->
    <div
      v-else-if="currentStory"
      class="story-container"
      @click="handleTap"
      @mousedown="handlePauseStart"
      @mouseup="handlePauseEnd"
      @mouseleave="handlePauseEnd"
      @touchstart="handlePauseStart"
      @touchend="handlePauseEnd"
    >
      <!-- Background Image -->
      <img
        :src="currentStory.mediaUrl"
        :key="currentStory.id"
        alt="Story Content"
        class="story-image"
      />

      <!-- Gradients -->
      <div class="overlay-top"></div>
      <div class="overlay-bottom"></div>

      <!-- Header -->
      <div class="header">
        <!-- Progress Bars -->
        <div class="progress-bars">
          <div
            v-for="(story, i) in userStories"
            :key="story.id"
            class="bar"
            :class="{ filled: i < currentIndex, active: i === currentIndex }"
            @click.stop="goToStory(i)"
          >
            <div
              class="fill"
              :style="{
                width:
                  i < currentIndex
                    ? '100%'
                    : i === currentIndex
                      ? progress + '%'
                      : '0%',
              }"
            ></div>
          </div>
        </div>

        <!-- User Info -->
        <div class="user-info">
          <div class="user-left">
            <img :src="user?.profilePicture" alt="Profile" class="avatar" />
            <span class="username">{{ user?.username }}</span>
            <span class="time">{{
              formatTimeAgo(currentStory.timestamp)
            }}</span>
          </div>

          <div class="user-right">
            <button class="icon-btn" @click.stop>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="19" cy="12" r="1"></circle>
                <circle cx="5" cy="12" r="1"></circle>
              </svg>
            </button>
            <button class="icon-btn" @click.stop="closeStory">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Story Counter -->
      <div class="story-counter">
        {{ currentIndex + 1 }} / {{ userStories.length }}
      </div>

      <!-- Footer -->
      <div class="footer" @click.stop>
        <div class="message-input">
          <input
            type="text"
            placeholder="Kirim pesan..."
            @focus="isPaused = true"
            @blur="isPaused = false"
          />
        </div>

        <button class="icon-btn">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            ></path>
          </svg>
        </button>

        <button class="icon-btn">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
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
.story-wrapper {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000;
}

.story-container {
  aspect-ratio: 9 / 16;
  height: 100%;
  width: auto;
  background-color: #000;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  user-select: none;
}

@media (max-width: 767px) {
  .story-container {
    width: 100%;
    height: 100vh;
    border-radius: 0;
  }
}

@media (min-width: 768px) {
  .story-container {
    height: 90vh;
    max-width: 500px;
    border-radius: 16px;
  }
}

.story-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

.overlay-top {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 120px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), transparent);
  z-index: 2;
  pointer-events: none;
}

.overlay-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 150px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  z-index: 2;
  pointer-events: none;
}

/* Header */
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
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  flex: 1;
  border-radius: 2px;
  overflow: hidden;
  cursor: pointer;
}

.bar .fill {
  height: 100%;
  background: white;
  border-radius: 2px;
  transition: none;
}

.bar.active .fill {
  transition: none;
}

.bar.filled .fill {
  width: 100% !important;
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
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  object-fit: cover;
}

.username {
  font-weight: 600;
  font-size: 14px;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.time {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.user-right {
  display: flex;
  gap: 12px;
}

/* Story Counter */
.story-counter {
  position: absolute;
  top: 80px;
  right: 16px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  z-index: 10;
}

/* Footer */
.footer {
  position: absolute;
  bottom: 20px;
  left: 0;
  width: 100%;
  padding: 0 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
}

.message-input {
  flex: 1;
}

.message-input input {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 24px;
  padding: 12px 20px;
  color: white;
  font-size: 14px;
  outline: none;
  backdrop-filter: blur(4px);
}

.message-input input::placeholder {
  color: rgba(255, 255, 255, 0.8);
}

.message-input input:focus {
  border-color: rgba(255, 255, 255, 0.7);
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  transition: transform 0.1s;
}

.icon-btn:active {
  transform: scale(0.9);
}

.icon-btn svg {
  stroke-width: 2px;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Loading & Error */
.loading,
.error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: white;
  text-align: center;
  gap: 20px;
}

.back-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #2563eb;
}
</style>
