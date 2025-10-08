import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://pokeapi.co/api/v2',
  timeout: 15000,
});

const memCache = new Map<string, any>();

export async function cachedGet<T>(url: string): Promise<T> {
  // url is like "/pokemon?offset=0&limit=151" or "/pokemon/bulbasaur"
  const key = `cache:${url}`;

  if (memCache.has(key)) return memCache.get(key);

  const ls = localStorage.getItem(key);
  if (ls) {
    const parsed = JSON.parse(ls);
    memCache.set(key, parsed);
    return parsed as T;
  }

  try {
    const { data } = await axiosClient.get<T>(url);
    memCache.set(key, data);
    localStorage.setItem(key, JSON.stringify(data));
    return data;
  } catch (err) {
    // Fallback to public/mock/<path>.json (strip query string)
    try {
      const pathOnly = url.split('?')[0];             // "/pokemon"
      const mockUrl = `/mock${pathOnly}.json`;        // "/mock/pokemon.json"
      const resp = await fetch(mockUrl);
      if (resp.ok) {
        const data = await resp.json();
        memCache.set(key, data);
        return data as T;
      }
    } catch { /* ignore */ }
    throw err;
  }
}
