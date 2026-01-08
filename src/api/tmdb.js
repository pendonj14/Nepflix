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
 * Fetches a movie logo from TMDB images endpoint
 * @param {number} movieId
 * @returns {Promise<string|null>} logo file_path
 */
export const fetchMovieLogo = async (movieId) => {
    try {
      let apiKey = import.meta.env.VITE_TMDB_API_KEY;
  
      if (!apiKey || apiKey.trim() === '' || apiKey === undefined) {
        apiKey = '05a3f3071ad3fa222ab689fb62ed0df1';
      }
  
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${movieId}/images?api_key=${apiKey}`
      );
  
      if (!response.ok) {
        throw new Error(`Failed to fetch movie images: ${response.statusText}`);
      }
  
      const data = await response.json();
      const logos = data.logos || [];
  
      // Prefer English logo, fallback to first available
      const selectedLogo =
        logos.find((logo) => logo.iso_639_1 === 'en') || logos[0];
  
      return selectedLogo ? selectedLogo.file_path : null;
    } catch (error) {
      console.error('Error fetching movie logo:', error);
      return null;
    }
  };
  

