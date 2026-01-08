import { useEffect, useState } from 'react';
import { fetchTrendingMovies } from '../api/tmdb';
import Header from '../components/Header';
import HeroSlideshow from '../components/HeroSlideshow';
import RecentlyWatched from '../components/RecentlyWatched';
import MovieRow from '../components/MovieRow';

/**
 * Home Page Component
 * Displays trending movies with hero slideshow and movie rows
 */
const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch trending movies when component mounts
    const loadMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        const trendingMovies = await fetchTrendingMovies();
        setMovies(trendingMovies);
      } catch (err) {
        setError(err.message || 'Failed to load movies');
        console.error('Error loading movies:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent overflow-y-hidden">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="text-xl text-gray-300">Loading movies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <div className="text-center">
          <p className="mb-4 text-xl text-red-400">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Get movies for recommendations (skip top 10 that are in hero)
  const recommendedMovies = movies.slice(10);

  return (
    <div className="min-h-screen bg-black">
      {/* Header with Search */}
      <Header />

      {/* Hero Slideshow - Top 10 Trending */}
      <HeroSlideshow movies={movies} />

      {/* Content Rows */}
      <main className="py-8">
        {/* Recently Watched */}
        <RecentlyWatched />

        {/* Recommended Movies */}
        <MovieRow title="Recommended for you" movies={recommendedMovies} />
      </main>
    </div>
  );
};

export default Home;

