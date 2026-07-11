const BASE = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
if (!API_KEY) throw new Error('VITE_TMDB_API_KEY is required');

const tmdbFetch = async (path) => {
  const res = await fetch(`${BASE}${path}${path.includes('?') ? '&' : '?'}api_key=${API_KEY}`);
  if (!res.ok) throw new Error(`TMDB ${path} failed: ${res.statusText}`);
  return res.json();
};

export const fetchTrendingMovies = async (pages = 1) => {
  const requests = Array.from({ length: pages }, (_, i) =>
    tmdbFetch(`/trending/movie/day?page=${i + 1}`)
  );
  return (await Promise.all(requests)).flatMap((d) => d.results || []);
};

export const fetchTrendingShows = async (pages = 1) => {
  const requests = Array.from({ length: pages }, (_, i) =>
    tmdbFetch(`/trending/tv/day?page=${i + 1}`)
  );
  return (await Promise.all(requests)).flatMap((d) => d.results || []);
};

export const searchMultiMedia = async (query, type = 'movie') => {
  if (!query?.trim()) return [];
  const endpoint = type === 'tv' ? 'search/tv' : 'search/movie';
  const data = await tmdbFetch(`/${endpoint}?query=${encodeURIComponent(query)}`);
  return data.results || [];
};

export const fetchLogo = async (id, type = 'movie') => {
  try {
    const endpoint = type === 'tv' ? `tv/${id}/images` : `movie/${id}/images`;
    const data = await tmdbFetch(`/${endpoint}`);
    const logos = data.logos || [];
    const logo = logos.find((l) => l.iso_639_1 === 'en') || logos[0];
    return logo ? logo.file_path : null;
  } catch {
    return null;
  }
};

export const fetchTVShowDetails = async (tvId) =>
  tmdbFetch(`/tv/${tvId}`);

export const fetchSeasonDetails = async (tvId, seasonNumber) =>
  tmdbFetch(`/tv/${tvId}/season/${seasonNumber}`);

export const getPosterUrl = (path) =>
  path ? `${IMG}/w500${path}` : 'https://via.placeholder.com/500x750?text=No+Image';

export const getBackdropUrl = (path) =>
  path ? `${IMG}/w1280${path}` : 'https://via.placeholder.com/1280x720?text=No+Image';

export const getLogoUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${IMG}/w500${path}`;
};

export const getStillUrl = (path, size = 'w500') =>
  path ? `${IMG}/${size}${path}` : '/episode-placeholder.png';
