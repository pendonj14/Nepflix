import { useEffect, useRef, useState, useCallback } from 'react';
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
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (location.state?.contentType) {
      setContentType(location.state.contentType);
    }
  }, [location.state?.contentType]);

  // Initial load: 2 pages so hero (10) + recs (30) are ready immediately
  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);
        setPage(2);
        setHasMore(true);
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

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const results = contentType === 'movie'
        ? await fetchTrendingMovies(1, nextPage)
        : await fetchTrendingShows(1, nextPage);
      setContent((prev) => [...prev, ...results]);
      setPage(nextPage);
      if (results.length < 20) setHasMore(false);
    } catch (err) {
      console.error('Error loading more:', err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [contentType, page, loadingMore, hasMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: '400px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, loading]);

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

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="flex justify-center py-8">
          {loadingMore && (
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-r-transparent" />
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
