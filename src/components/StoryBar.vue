<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRouter } from "vue-router";
import { RecycleScroller } from "vue-virtual-scroller";
import { api } from "@/utils/api.js";
import { createUsersMap } from "@/utils/storyHelpers.js";

const router = useRouter();
const scrollerRef = ref(null);

const isLoading = ref(false);
const isLoadingMore = ref(false);
const stories = ref([]);
const users = ref([]);
const page = ref(1);
const limit = 18;
const hasMore = ref(true);

let scrollTimeout = null;

const usersMap = computed(() => createUsersMap(users.value));

const storiesWithUsers = computed(() => {
  return stories.value.map((story) => {
    const user = usersMap.value.get(story.userId);
    return {
      ...story,
      userName: user?.username ?? "Unknown",
      userAvatar: user?.profilePicture,
    };
  });
});

const fetchUsers = async (userIds) => {
  const existingIds = new Set(users.value.map((u) => Number(u.id)));
  const newIds = userIds.filter((id) => !existingIds.has(id));
  if (newIds.length > 0) {
    const newUsers = await api.fetchUsersByIds(newIds);
    users.value = [...users.value, ...newUsers];
  }
};

const fetchStories = async () => {
  try {
    isLoading.value = true;
    page.value = 1;
    const { data, pages } = await api.fetchStoriesPaginated(1, limit);
    stories.value = data;
    hasMore.value = page.value < pages;
    await fetchUsers(data.map((s) => s.userId));
    await nextTick();
    // observeImages();
  } catch (err) {
    console.error("StoryBar fetch error:", err);
  } finally {
    isLoading.value = false;
  }
};

const loadMore = async () => {
  if (isLoadingMore.value || !hasMore.value) return;
  try {
    isLoadingMore.value = true;
    page.value++;
    const { data, pages } = await api.fetchStoriesPaginated(page.value, limit);
    if (!data || data.length === 0) {
      hasMore.value = false;
      return;
    }
    stories.value = [...stories.value, ...data];
    hasMore.value = page.value < pages;
    await fetchUsers(data.map((s) => s.userId));
  } catch (err) {
    console.error("StoryBar loadMore error:", err);
    page.value--;
  } finally {
    isLoadingMore.value = false;
  }
};

// Horizontal infinite scroll
const onHorizontalScroll = () => {
  if (scrollTimeout) clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    if (!scrollerRef.value?.$el) return;
    const el = scrollerRef.value.$el;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth * 0.8) {
      loadMore();
    }
  }, 100);
};

onMounted(() => {
  fetchStories();
});

onBeforeUnmount(() => {
  if (scrollTimeout) clearTimeout(scrollTimeout);
});
</script>

<template>
  <section class="stories-section">
    <!-- Loading skeleton -->
    <div v-if="isLoading" class="stories-scroll">
      <div class="story-item skeleton" v-for="n in 12" :key="n">
        <div class="avatar-ring">
          <div class="story-avatar skeleton-avatar"></div>
        </div>
        <div class="story-name skeleton-text"></div>
      </div>
    </div>

    <!-- Virtual scroller horizontal -->
    <RecycleScroller
      v-else
      ref="scrollerRef"
      class="stories-scroll"
      :items="storiesWithUsers"
      :item-size="88"
      key-field="id"
      direction="horizontal"
      v-slot="{ item }"
      @scroll.native="onHorizontalScroll"
    >
      <router-link
        :to="{
          name: 'detail',
          params: { username: item.userName, storyId: item.id },
        }"
        class="story-item"
      >
        <div class="avatar-ring" :class="{ seen: item.hasViewed }">
          <img
            :src="item.userAvatar"
            class="story-avatar"
            :alt="item.userName"
            loading="lazy"
          />
        </div>
        <span class="story-name">{{ item.userName }}</span>
      </router-link>
    </RecycleScroller>

    <!-- Loading more indicator -->
    <div v-if="isLoadingMore" class="loading-indicator">Loading...</div>
  </section>
</template>

<style scoped>
.stories-scroll {
  height: 110px;
}

.story-item {
  width: 80px;
  padding: 0 4px;
  text-decoration: none;
}

.skeleton-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #334155;
}

.loading-indicator {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 12px;
}
</style>
