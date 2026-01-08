import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBackdropUrl, getLogoUrl, fetchMovieLogo } from '../api/tmdb';

/**
 * HeroSlideshow Component
 * Displays a slideshow of the top 10 trending movies with auto-play
 */
const HeroSlideshow = ({ movies }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const [movieLogo, setMovieLogo] = useState(null);

  // Get top 10 movies
  const topMovies = movies.slice(0, 10);
  
  // Auto-advance slideshow every 5 seconds
  useEffect(() => {
    if (topMovies.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % topMovies.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [topMovies.length]);

  if (topMovies.length === 0) {
    return null;
  }

  const currentMovie = topMovies[currentIndex];

  const handlePlayClick = () => {
    navigate(`/watch/${currentMovie.id}`);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };
  useEffect(() => {
    if (!currentMovie?.id) return;
  
    setMovieLogo(null); // reset between slides
    fetchMovieLogo(currentMovie.id).then(setMovieLogo);
  }, [currentMovie]);
  
  return (
    <div className="relative h-[70vh] min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${getBackdropUrl(currentMovie.backdrop_path)})`,
          opacity: 0.8,
        }}
      >
        {/* Gradient Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-end">
        <div className="container mx-auto px-4 pb-16">
          <div className="pl-20 px-20">
            {/* Movie Title / Logo */}
            {movieLogo ? (
              <img
                src={getLogoUrl(movieLogo)}
                alt={currentMovie.title}
                className="mb-4 max-h-24 w-auto drop-shadow-lg"
                loading="lazy"
              />
            ) : (
              <h1 className="mb-4 text-5xl font-bold text-white drop-shadow-lg md:text-6xl lg:text-7xl font-bebas-neue text-transform:uppercase">
                {currentMovie.title}
              </h1>
            )}

            
            {/* Movie Info */}
            <div className="mb-6 flex flex-wrap items-center gap-4 text-white">
              {currentMovie.release_date && (
                <span className="text-lg">
                  {new Date(currentMovie.release_date).getFullYear()}
                </span>
              )}
              {currentMovie.vote_average && (
                <span className="flex items-center gap-1 text-lg">
                  <span className="text-yellow-400">⭐</span>
                  {currentMovie.vote_average.toFixed(1)}/10
                </span>
              )}
            </div>

            {/* Overview */}
            <div className="mt-4 flex items-start justify-between">
              {currentMovie.overview && (
                <p className="flex-1 line-clamp-3 text-lg text-gray-200 drop-shadow-md max-w-2xl font-helvetica">
                  {currentMovie.overview}
                </p>
              )}

              <div className="flex-shrink-0 mr-10">
                <button
                  onClick={handlePlayClick}
                  className="flex items-center gap-2 rounded-full bg-[#ffc30e] px-5 py-5 text-lg font-semibold text-black transition-transform hover:scale-105 hover:bg-transparent hover:text-[#ffc30e] hover:ring-2 hover:ring-[#ffc30e]"
                >
                  <svg className="h-11 w-11" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>

                </button>
              </div>
            </div>


            {/* Carousel Indicators */}
            <div className="mt-10 flex gap-2 justify-center">
              {topMovies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-8 bg-[#ffc30e]'
                      : 'w-2 bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSlideshow;

