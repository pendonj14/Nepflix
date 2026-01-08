import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getPosterUrl } from '../api/tmdb';
import { useScrollFade } from '../hooks/useScrollFade'; 

// 1. MovieCard with "group/card" to isolate the card hover
const MovieCard = ({ movie }) => {
  const [ref, progress] = useScrollFade();

  return (
    <Link
      ref={ref}
      to={`/watch/${movie.id}`}
      // CHANGE: used 'group/card' instead of just 'group'
      className="group/card relative min-w-[200px] flex-shrink-0 rounded-lg bg-slate-800 overflow-hidden hover:ring-2 hover:ring-[#ffc30e] hover:scale-110 z-0 hover:z-10"
      style={{
        opacity: progress,
        transform: `translateY(${40 - progress * 40}px)`,
        transition: 'opacity 0.1s linear, transform 0.1s linear, scale 0.3s ease', 
      }}
    >
      <div className="aspect-[2/3] w-full overflow-hidden">
        <img
          src={getPosterUrl(movie.poster_path)}
          alt={movie.title}
          loading="lazy"
          // CHANGE: used 'group-hover/card'
          className="h-80 w-70 object-cover transition-transform duration-300 group-hover/card:scale-110"
        />
      </div>

      {/* Hover overlay */}
      {/* CHANGE: used 'group-hover/card' */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="rounded-full bg-[#ffc30e] p-4">
          <svg className="h-5 w-5 text-black" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </Link>
  );
};

const RecentlyWatched = () => {
  const [recentMovies, setRecentMovies] = useState([]);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const loadRecentMovies = () => {
      try {
        const stored = localStorage.getItem('recentlyWatched');
        if (stored) {
          const movies = JSON.parse(stored).reverse();
          setRecentMovies(movies);
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
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 300;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  if (!recentMovies.length) return null;

  return (
    <section className="mb-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold font-bebas text-white pl-10 mb-4">
          Recently Watched
        </h2>

        {/* CHANGE: used 'group/slider' so it doesn't conflict with cards */}
        <div className="relative group/slider px-8">
          
          {/* Left Button - triggers on slider hover */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-[#ffc30e] text-white hover:text-black p-3 rounded-full transition-all opacity-0 group-hover/slider:opacity-100 hidden md:flex items-center justify-center"
            aria-label="Scroll Left"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide py-5 px-2 scroll-smooth"
          >
            {recentMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {/* Right Button - triggers on slider hover */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-[#ffc30e] text-white hover:text-black p-3 rounded-full transition-all opacity-0 group-hover/slider:opacity-100 hidden md:flex items-center justify-center"
            aria-label="Scroll Right"
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