const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const api = {
  async fetchStories() {
    const response = await fetch(`${API_BASE}/stories`);
    if (!response.ok) throw new Error("Failed to fetch stories");
    return response.json();
  },

  async fetchUsers() {
    const response = await fetch(`${API_BASE}/users`);
    if (!response.ok) throw new Error("Failed to fetch users");
    return response.json();
  },

  async fetchStoriesAndUsers() {
    const [stories, users] = await Promise.all([
      this.fetchStories(),
      this.fetchUsers(),
    ]);
    return { stories, users };
  },

  // Paginated fetch for stories (json-server v1 uses _page & _per_page)
  // Sort by timestamp descending (newest first)
  async fetchStoriesPaginated(page = 1, perPage = 10) {
    const response = await fetch(
      `${API_BASE}/stories?_page=${page}&_per_page=${perPage}&_sort=-timestamp`,
    );
    if (!response.ok) throw new Error("Failed to fetch stories");
    const result = await response.json();
    // json-server v1 returns { data, first, prev, next, last, pages, items }
    if (result.data) {
      return { data: result.data, total: result.items, pages: result.pages };
    }
    // fallback for older json-server
    return { data: result, total: result.length, pages: 1 };
  },

  // Paginated fetch for users
  async fetchUsersPaginated(page = 1, perPage = 10) {
    const response = await fetch(
      `${API_BASE}/users?_page=${page}&_per_page=${perPage}`,
    );
    if (!response.ok) throw new Error("Failed to fetch users");
    const result = await response.json();
    if (result.data) {
      return { data: result.data, total: result.items, pages: result.pages };
    }
    return { data: result, total: result.length, pages: 1 };
  },

  // Fetch users by IDs (for getting user info of stories)
  async fetchUsersByIds(userIds) {
    if (!userIds.length) return [];
    const uniqueIds = [...new Set(userIds)];
    const query = uniqueIds.map((id) => `id=${id}`).join("&");
    const response = await fetch(`${API_BASE}/users?${query}`);
    if (!response.ok) throw new Error("Failed to fetch users");
    return response.json();
  },

  async fetchStoryById(storyId) {
    const response = await fetch(`${API_BASE}/stories/${storyId}`);
    if (!response.ok) throw new Error("Failed to fetch story");
    return response.json();
  },

  async fetchUserById(userId) {
    const response = await fetch(`${API_BASE}/users/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch user");
    return response.json();
  },

  async fetchStoriesByUserId(userId) {
    const response = await fetch(
      `${API_BASE}/stories?userId=${userId}&_sort=-timestamp`,
    );
    if (!response.ok) throw new Error("Failed to fetch user stories");
    return response.json();
  },
};
