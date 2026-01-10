import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBackdropUrl, getLogoUrl, fetchLogo } from '../api/tmdb';

/**
 * HeroSlideshow Component
 * Displays a slideshow of the top 10 trending movies or TV shows with auto-play
 */
const HeroSlideshow = ({ content = [], contentType = 'movie' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [logo, setLogo] = useState(null);
  const navigate = useNavigate();

  // Get top 10 content
  const topContent = content.slice(0, 10);

  if (topContent.length === 0) {
    return null;
  }

  const currentItem = topContent[currentIndex];
  const title = currentItem?.title || currentItem?.name || 'Unknown';
  const releaseDate = currentItem?.release_date || currentItem?.first_air_date;

  // Auto-advance slideshow every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % topContent.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [topContent.length]);

  // Fetch logo for current item
  useEffect(() => {
    if (!currentItem?.id) return;

    setLogo(null);
    fetchLogo(currentItem.id, contentType).then(setLogo).catch(() => {
      setLogo(null);
    });
  }, [currentItem?.id, contentType]);

  const handlePlayClick = () => {
    navigate(`/watch/${contentType}/${currentItem.id}`);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };
  
  return (
    <div className="relative h-[70vh] min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${getBackdropUrl(currentItem?.backdrop_path)})`,
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
            {/* Title / Logo */}
            {logo ? (
              <img
                src={getLogoUrl(logo)}
                alt={title}
                className="mb-4 max-h-24 w-auto drop-shadow-lg"
                loading="lazy"
              />
            ) : (
              <h1 className="mb-4 text-5xl font-bold text-white drop-shadow-lg md:text-6xl lg:text-7xl font-bebas-neue">
                {title}
              </h1>
            )}

            {/* Content Info */}
            <div className="mb-6 flex flex-wrap items-center gap-4 text-white">
              {releaseDate && (
                <span className="text-lg">
                  {new Date(releaseDate).getFullYear()}
                </span>
              )}
              {currentItem?.vote_average && (
                <span className="flex items-center gap-1 text-lg">
                  <span className="text-yellow-400">⭐</span>
                  {currentItem.vote_average.toFixed(1)}/10
                </span>
              )}
            </div>

            {/* Overview */}
            <div className="mt-4 flex items-start justify-between">
              {currentItem?.overview && (
                <p className="flex-1 line-clamp-3 text-lg text-gray-200 drop-shadow-md max-w-2xl">
                  {currentItem.overview}
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
              {topContent.map((_, index) => (
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

