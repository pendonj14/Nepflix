import { useEffect, useState } from 'react';
import { fetchTrendingMovies, fetchTrendingShows } from '../api/tmdb';
import Header from '../components/Header';
import HeroSlideshow from '../components/HeroSlideshow';
import RecentlyWatched from '../components/RecentlyWatched';
import MovieRow from '../components/MovieRow';

/**
 * Home Page Component
 * Displays trending movies, TV shows, or anime with hero slideshow and content rows
 */
const Home = () => {
  const [contentType, setContentType] = useState('movie');
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch trending content when component mounts or content type changes
    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);
        let trendingContent;
        if (contentType === 'movie') {
          trendingContent = await fetchTrendingMovies();
        } else if (contentType === 'tv') {
          trendingContent = await fetchTrendingShows();
        }
        setContent(trendingContent);
      } catch (err) {
        let errorMsg = 'Failed to load content';
        if (contentType === 'movie') errorMsg = 'Failed to load movies';
        else if (contentType === 'tv') errorMsg = 'Failed to load TV shows';
        
        setError(err.message || errorMsg);
        console.error('Error loading content:', err);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [contentType]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent overflow-y-hidden">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="text-xl text-gray-300">Loading {contentType === 'movie' ? 'movies' : contentType === 'tv' ? 'TV shows' : 'anime'}...</p>
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

  // Get content for recommendations (skip top 10 that are in hero)
  const recommendedContent = content.slice(10);

  return (
    <div className="min-h-screen bg-black">
      {/* Header with Search */}
      <Header contentType={contentType} onContentTypeChange={setContentType} />

      {/* Hero Slideshow - Top 10 Trending */}
      <HeroSlideshow content={content} contentType={contentType} />

      {/* Content Rows */}
      <main className="py-8">
        {/* Recently Watched */}
        <RecentlyWatched />

        {/* Recommended Content */}
        <MovieRow 
          title={contentType === 'movie' ? 'Recommended Movies' : contentType === 'tv' ? 'Recommended TV Shows' : 'Recommended Anime'} 
          movies={recommendedContent}
          contentType={contentType}
        />
      </main>
    </div>
  );
};

export default Home;

