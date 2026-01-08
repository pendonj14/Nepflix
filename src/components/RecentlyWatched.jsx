import { useState, useEffect, useRef } from 'react';
import MovieCard from '../components/MovieCard';

const RecentlyWatched = () => {
  const [recentMovies, setRecentMovies] = useState([]);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const loadRecentMovies = () => {
      try {
        const stored = localStorage.getItem('recentlyWatched');
        if (stored) {
          setRecentMovies(JSON.parse(stored).reverse());
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadRecentMovies();
    window.addEventListener('storage', loadRecentMovies);
    return () => window.removeEventListener('storage', loadRecentMovies);
  }, []);

  const scroll = (direction) => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 300;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!recentMovies.length) return null;

  return (
    <section className="mb-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold font-bebas text-white pl-10 mb-4">
          Recently Watched
        </h2>

        <div className="relative group/slider px-8">
          {/* Left button */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20
                       bg-black/60 hover:bg-[#ffc30e]
                       text-white hover:text-black
                       p-3 rounded-full transition-all
                       opacity-0 group-hover/slider:opacity-100
                       hidden md:flex"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Slider */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide py-5 px-2 scroll-smooth"
          >
            {recentMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {/* Right button */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20
                       bg-black/60 hover:bg-[#ffc30e]
                       text-white hover:text-black
                       p-3 rounded-full transition-all
                       opacity-0 group-hover/slider:opacity-100
                       hidden md:flex"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default RecentlyWatched;
