import { ref, onMounted, toValue } from "vue";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function useFetch(url) {
  const data = ref(null);
  const error = ref(null);

  onMounted(async () => {
    try {
      const url = `${BASE_URL}${toValue(endpoint)}`;
      const res = await fetch(url);
      data.value = await res.json();
    } catch (err) {
      error.value = err;
    }
  });

  return { data, error };
}
