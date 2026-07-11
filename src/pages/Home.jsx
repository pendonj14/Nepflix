import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchTrendingMovies, fetchTrendingShows } from '../api/tmdb';
import Header from '../components/Header';
import HeroSlideshow from '../components/HeroSlideshow';
import RecentlyWatched from '../components/RecentlyWatched';
import MovieRow from '../components/MovieRow';

const Home = () => {
  const location = useLocation();
  const [contentType, setContentType] = useState('movie');
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location.state?.contentType) {
      setContentType(location.state.contentType);
    }
  }, [location.state?.contentType]);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);
        const trendingContent = contentType === 'movie'
          ? await fetchTrendingMovies(2)
          : await fetchTrendingShows(2);
        setContent(trendingContent);
      } catch (err) {
        setError(err.message || `Failed to load ${contentType === 'movie' ? 'movies' : 'TV shows'}`);
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
          <p className="text-xl text-gray-300">Loading {contentType === 'movie' ? 'movies' : 'TV shows'}...</p>
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

  return (
    <div className="min-h-screen bg-black">
      <Header contentType={contentType} onContentTypeChange={setContentType} />
      <HeroSlideshow content={content} contentType={contentType} />
      <main className="py-8">
        <RecentlyWatched />
        <MovieRow
          title={contentType === 'movie' ? 'Recommended Movies' : 'Recommended TV Shows'}
          movies={content.slice(10)}
          contentType={contentType}
        />
      </main>
    </div>
  );
};

export default Home;
