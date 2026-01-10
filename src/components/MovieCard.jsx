import { Link } from 'react-router-dom';
import { getPosterUrl } from '../api/tmdb';
import { useScrollFade } from '../hooks/useScrollFade';

const MovieCard = ({ movie, contentType }) => {
  const [ref, progress] = useScrollFade();
  
  // Handle movies, TV shows, and anime
  const title = movie.title || movie.name;
  // Use contentType if provided, otherwise determine from data
  let type = contentType;
  if (!type) {
    type = movie.title && !movie.name ? 'movie' : 'tv';
  }

  return (
    <Link
      ref={ref}
      to={`/watch/${type}/${movie.id}`}
      className="group/card relative min-w-[200px] flex-shrink-0
                 rounded-lg bg-slate-800 overflow-hidden
                 hover:ring-2 hover:ring-[#ffc30e]
                 hover:scale-110 z-0 hover:z-10"
      style={{
        opacity: progress,
        transform: `translateY(${40 - progress * 40}px)`,
        transition:
          'opacity 0.1s linear, transform 0.1s linear, scale 0.3s ease',
      }}
    >
      {/* Poster container controls size */}
      <div className="relative w-full aspect-[2/3] overflow-hidden">
        <img
          src={getPosterUrl(movie.poster_path)}
          alt={title}
          loading="lazy"
          className="
            absolute inset-0
            w-full h-full
            object-cover
            transition-transform duration-300
            group-hover/card:scale-110
          "
        />
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0
                      group-hover/card:opacity-100
                      transition-opacity duration-300
                      flex items-center justify-center">
        <div className="rounded-full bg-[#ffc30e] p-4">
          <svg className="h-5 w-5 text-black" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
