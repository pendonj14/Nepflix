import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchTrendingMovies, getPosterUrl } from '../api/tmdb';
import Header from '../components/Header';

/**
 * Watch Page Component
 * Displays the Videasy iframe player for streaming the selected movie
 */
const Watch = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch movie details to display title and poster
    const loadMovie = async () => {
      try {
        setLoading(true);
        // Since we're using trending movies, we can fetch them and find the matching one
        const movies = await fetchTrendingMovies();
        const foundMovie = movies.find((m) => m.id.toString() === id);
        setMovie(foundMovie);

        // Save to recently watched in localStorage
        if (foundMovie) {
          try {
            const stored = localStorage.getItem('recentlyWatched');
            let recentMovies = stored ? JSON.parse(stored) : [];
            
            // Remove if already exists (to avoid duplicates)
            recentMovies = recentMovies.filter((m) => m.id !== foundMovie.id);
            
            // Add to beginning
            recentMovies.push({
              id: foundMovie.id,
              title: foundMovie.title,
              poster_path: foundMovie.poster_path,
              release_date: foundMovie.release_date,
              watchedAt: new Date().toISOString(),
            });
            
            // Keep only last 20 movies
            if (recentMovies.length > 20) {
              recentMovies = recentMovies.slice(-20);
            }
            
            localStorage.setItem('recentlyWatched', JSON.stringify(recentMovies));
          } catch (error) {
            console.error('Error saving to recently watched:', error);
          }
        }
      } catch (error) {
        console.error('Error loading movie:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadMovie();
    }
  }, [id]);

  // Videasy player URL using TMDB movie ID
  const videasyUrl = `https://player.videasy.net/movie/${id}`;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="text-xl text-gray-300">Loading player...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header with search */}
      <Header />


      {/* Video Player Container */}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Videasy iframe player */}
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black shadow-2xl">
            <iframe
              src={videasyUrl}
              className="h-full w-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title={movie?.title || 'Movie Player'}
            ></iframe>
          </div>

          {/* Movie Info (if available) */}
          {movie && (
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              <div className="md:col-span-1">
                <img
                  src={getPosterUrl(movie.poster_path)}
                  alt={movie.title}
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
              <div className="md:col-span-2">
                <h2 className="mb-4 text-2xl font-bold text-white">
                  {movie.title}
                </h2>
                {movie.overview && (
                  <p className="mb-4 text-gray-300 leading-relaxed">
                    {movie.overview}
                  </p>
                )}
                {movie.vote_average && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Rating:</span>
                    <span className="text-yellow-400">
                      ⭐ {movie.vote_average.toFixed(1)}/10
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Watch;

