/**
 * TMDB API service
 * Handles fetching trending movies from The Movie Database API
 */

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_LOGO_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';

/**
 * Fetches trending movies from TMDB
 * @param {number} pages - number of pages to fetch (20 movies per page)
 * @returns {Promise<Array>}
 */
export const fetchTrendingMovies = async (pages = 1) => {
  try {
    let apiKey = import.meta.env.VITE_TMDB_API_KEY;

    if (!apiKey || apiKey.trim() === '') {
      apiKey = '05a3f3071ad3fa222ab689fb62ed0df1';
    }

    if (!apiKey) {
      throw new Error('TMDB API key missing');
    }

    const requests = [];

    for (let page = 1; page <= pages; page++) {
      requests.push(
        fetch(
          `${TMDB_BASE_URL}/trending/movie/day?api_key=${apiKey}&page=${page}`
        ).then((res) => {
          if (!res.ok) {
            throw new Error(`Failed page ${page}`);
          }
          return res.json();
        })
      );
    }

    const responses = await Promise.all(requests);

    return responses.flatMap((data) => data.results || []);
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    throw error;
  }
};

/**
 * Gets the full poster image URL from TMDB
 * @param {string} posterPath - The poster path from TMDB
 * @returns {string} Full image URL
 */
export const getPosterUrl = (posterPath) => {
  if (!posterPath) {
    return 'https://via.placeholder.com/500x750?text=No+Image';
  }
  return `${TMDB_IMAGE_BASE_URL}${posterPath}`;
};

export const getLogoUrl = (logoPath) => {
  if (!logoPath) return null;
  if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
    return logoPath;
  }
  return `${TMDB_LOGO_BASE_URL}${logoPath}`;
};

/**
 * Gets the full backdrop image URL from TMDB
 * @param {string} backdropPath - The backdrop path from TMDB
 * @returns {string} Full image URL
 */
export const getBackdropUrl = (backdropPath) => {
  if (!backdropPath) {
    return 'https://via.placeholder.com/1280x720?text=No+Image';
  }
  return `${TMDB_BACKDROP_BASE_URL}${backdropPath}`;
};

/**
 * Searches for movies using TMDB API
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of movie objects
 */
export const searchMovies = async (query) => {
  try {
    let apiKey = import.meta.env.VITE_TMDB_API_KEY;
    
    if (!apiKey || apiKey.trim() === '' || apiKey === undefined) {
      apiKey = '05a3f3071ad3fa222ab689fb62ed0df1';
    }

    if (!query || query.trim() === '') {
      return [];
    }

    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`Failed to search movies: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
};

/**
 * Fetches trending TV shows from TMDB
 * @param {number} pages - number of pages to fetch (20 shows per page)
 * @returns {Promise<Array>}
 */
export const fetchTrendingShows = async (pages = 1) => {
  try {
    let apiKey = import.meta.env.VITE_TMDB_API_KEY;

    if (!apiKey || apiKey.trim() === '') {
      apiKey = '05a3f3071ad3fa222ab689fb62ed0df1';
    }

    if (!apiKey) {
      throw new Error('TMDB API key missing');
    }

    const requests = [];

    for (let page = 1; page <= pages; page++) {
      requests.push(
        fetch(
          `${TMDB_BASE_URL}/trending/tv/day?api_key=${apiKey}&page=${page}`
        ).then((res) => {
          if (!res.ok) {
            throw new Error(`Failed page ${page}`);
          }
          return res.json();
        })
      );
    }

    const responses = await Promise.all(requests);

    return responses.flatMap((data) => data.results || []);
  } catch (error) {
    console.error('Error fetching trending shows:', error);
    throw error;
  }
};

/**
 * Searches for movies or TV shows using TMDB API
 * @param {string} query - Search query
 * @param {string} type - 'movie' or 'tv'
 * @returns {Promise<Array>} Array of results
 */
export const searchMultiMedia = async (query, type = 'movie') => {
  try {
    let apiKey = import.meta.env.VITE_TMDB_API_KEY;
    
    if (!apiKey || apiKey.trim() === '' || apiKey === undefined) {
      apiKey = '05a3f3071ad3fa222ab689fb62ed0df1';
    }

    if (!query || query.trim() === '') {
      return [];
    }

    const endpoint = type === 'tv' ? 'search/tv' : 'search/movie';
    const response = await fetch(
      `${TMDB_BASE_URL}/${endpoint}?api_key=${apiKey}&query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`Failed to search: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching:', error);
    throw error;
  }
};

/**
 * Fetches a movie or TV show logo from TMDB images endpoint
 * @param {number} id - Movie or TV show ID
 * @param {string} type - 'movie' or 'tv'
 * @returns {Promise<string|null>} logo file_path
 */
export const fetchLogo = async (id, type = 'movie') => {
    try {
      let apiKey = import.meta.env.VITE_TMDB_API_KEY;
  
      if (!apiKey || apiKey.trim() === '' || apiKey === undefined) {
        apiKey = '05a3f3071ad3fa222ab689fb62ed0df1';
      }
  
      const endpoint = type === 'tv' ? `tv/${id}/images` : `movie/${id}/images`;
      const response = await fetch(
        `${TMDB_BASE_URL}/${endpoint}?api_key=${apiKey}`
      );
  
      if (!response.ok) {
        throw new Error(`Failed to fetch images: ${response.statusText}`);
      }
  
      const data = await response.json();
      const logos = data.logos || [];
  
      // Prefer English logo, fallback to first available
      const selectedLogo =
        logos.find((logo) => logo.iso_639_1 === 'en') || logos[0];
  
      return selectedLogo ? selectedLogo.file_path : null;
    } catch (error) {
      console.error('Error fetching logo:', error);
      return null;
    }
  };

/**
 * Fetches a movie logo from TMDB images endpoint
 * @param {number} movieId
 * @returns {Promise<string|null>} logo file_path
 */
export const fetchMovieLogo = async (movieId) => {
    return fetchLogo(movieId, 'movie');
  };

/**
 * Fetches TV show details including seasons and episodes
 * @param {number} tvId - TV show ID from TMDB
 * @returns {Promise<Object>} TV show details
 */
export const fetchTVShowDetails = async (tvId) => {
  try {
    let apiKey = import.meta.env.VITE_TMDB_API_KEY;

    if (!apiKey || apiKey.trim() === '') {
      apiKey = '05a3f3071ad3fa222ab689fb62ed0df1';
    }

    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${tvId}?api_key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch TV show details: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching TV show details:', error);
    throw error;
  }
};

/**
 * Fetches season details for a TV show
 * @param {number} tvId - TV show ID from TMDB
 * @param {number} seasonNumber - Season number
 * @returns {Promise<Object>} Season details with episodes
 */
export const fetchSeasonDetails = async (tvId, seasonNumber) => {
  try {
    let apiKey = import.meta.env.VITE_TMDB_API_KEY;

    if (!apiKey || apiKey.trim() === '') {
      apiKey = '05a3f3071ad3fa222ab689fb62ed0df1';
    }

    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch season details: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching season details:', error);
    throw error;
  }
};

