import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchTrendingMovies, fetchTrendingShows, getPosterUrl, fetchTVShowDetails, fetchSeasonDetails } from '../api/tmdb';
import Header from '../components/Header';

/**
 * Watch Page Component
 * Displays the Videasy iframe player for streaming the selected movie, TV show, or anime
 */
const Watch = () => {
  const { id, type } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [episodes, setEpisodes] = useState([]);

  useEffect(() => {
    // Fetch content details
    const loadContent = async () => {
      try {
        setLoading(true);
        let foundContent;

        if (type === 'anime') {
          // Fetch anitails
          foundContent = await fetchTVShowDetails(id);
          setContent(foundContent);
          
          // Set up seasons
          if (foundContent.seasons) {
            // Regular TV shows have seasons
            setSeasons(foundContent.seasons);
            // Load first season's episodes
            if (foundContent.seasons.length > 0) {
              const firstSeason = foundContent.seasons[0];
              const seasonDetails = await fetchSeasonDetails(id, firstSeason.season_number);
              setEpisodes(seasonDetails.episodes || []);
              setSelectedSeason(firstSeason.season_number);
              setSelectedEpisode(1);
            }
          }
        } else {
          // Fetch movie details
          const movies = await fetchTrendingMovies();
          foundContent = movies.find((m) => m.id.toString() === id);
          setContent(foundContent);
        }

        // Save to recently watched in localStorage
        if (foundContent) {
          try {
            const stored = localStorage.getItem('recentlyWatched');
            let recentItems = stored ? JSON.parse(stored) : [];
            
            // Remove if already exists (to avoid duplicates)
            recentItems = recentItems.filter((item) => item.id !== foundContent.id);
            
            // Add to beginning
            recentItems.push({
              id: foundContent.id,
              title: foundContent.title || foundContent.name,
              poster_path: foundContent.poster_path,
              release_date: foundContent.release_date || foundContent.first_air_date,
              watchedAt: new Date().toISOString(),
              type: type,
            });
            
            // Keep only last 20 items
            if (recentItems.length > 20) {
              recentItems = recentItems.slice(-20);
            }
            
            localStorage.setItem('recentlyWatched', JSON.stringify(recentItems));
          } catch (error) {
            console.error('Error saving to recently watched:', error);
          }
        }
      } catch (error) {
        console.error('Error loading content:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id && type) {
      loadContent();
    }
  }, [id, type]);

  // Handle season change
  const handleSeasonChange = async (seasonNumber) => {
    try {
      setSelectedSeason(seasonNumber);
      setSelectedEpisode(1);
      const seasonDetails = await fetchSeasonDetails(id, seasonNumber);
      setEpisodes(seasonDetails.episodes || []);
    } catch (error) {
      console.error('Error loading season details:', error);
    }
  };

  // Generate Videasy player URL
  const getVideasyUrl = () => {
    if (type === 'tv') {
      // For TV shows: tv/{show_id}/{season}/{episode}
      return `https://player.videasy.net/tv/${id}/${selectedSeason}/${selectedEpisode}`;
    } else {
      // For movies: movie/{id}
      return `https://player.videasy.net/movie/${id}`;
    }
  };

  const videasyUrl = getVideasyUrl();
  const title = content?.title || content?.name || 'Loading...';

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
              key={videasyUrl}
              src={videasyUrl}
              className="h-full w-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title={title}
            ></iframe>
          </div>

          {/* TV Show Controls */}
          {type === 'tv' && seasons.length > 0 && (
            <div className="mt-6 rounded-lg bg-slate-800 p-6">
              {/* Season Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-white mb-3">
                  Select Season
                </label>
                <div className="flex flex-wrap gap-2">
                  {seasons.map((season) => (
                    <button
                      key={season.season_number}
                      onClick={() => handleSeasonChange(season.season_number)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedSeason === season.season_number
                          ? 'bg-[#ffc30e] text-black'
                          : 'bg-slate-700 text-white hover:bg-slate-600'
                      }`}
                    >
                      Season {season.season_number}
                    </button>
                  ))}
                </div>
              </div>

              {/* Episode Selector */}
              {episodes.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Select Episode
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {episodes.map((episode) => (
                      <button
                        key={episode.episode_number}
                        onClick={() => setSelectedEpisode(episode.episode_number)}
                        className={`p-3 rounded-lg text-left transition-all ${
                          selectedEpisode === episode.episode_number
                            ? 'bg-[#ffc30e] text-black'
                            : 'bg-slate-700 text-white hover:bg-slate-600'
                        }`}
                      >
                        <div className="font-semibold">
                          Ep {episode.episode_number}: {episode.name}
                        </div>
                        {episode.air_date && (
                          <div className="text-xs opacity-75">
                            {new Date(episode.air_date).toLocaleDateString()}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Content Info */}
          {content && (
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              <div className="md:col-span-1">
                <img
                  src={getPosterUrl(content.poster_path)}
                  alt={title}
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
              <div className="md:col-span-2">
                <h2 className="mb-4 text-2xl font-bold text-white">
                  {title}
                </h2>
                {type === 'tv' && content.number_of_seasons && (
                  <p className="mb-2 text-gray-400">
                    <span className="font-semibold">Seasons:</span> {content.number_of_seasons} | 
                    <span className="font-semibold ml-2">Episodes:</span> {content.number_of_episodes}
                  </p>
                )}
                {type === 'tv' && content.first_air_date && (
                  <p className="mb-2 text-gray-400">
                    <span className="font-semibold">First Air Date:</span> {content.first_air_date}
                  </p>
                )}
                {type === 'movie' && content.release_date && (
                  <p className="mb-2 text-gray-400">
                    <span className="font-semibold">Release Date:</span> {content.release_date}
                  </p>
                )}
                {content.overview && (
                  <p className="mb-4 text-gray-300 leading-relaxed">
                    {content.overview}
                  </p>
                )}
                {content.vote_average && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Rating:</span>
                    <span className="text-yellow-400">
                      ⭐ {content.vote_average.toFixed(1)}/10
                    </span>
                  </div>
                )}
                {content.genres && content.genres.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {content.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="inline-block bg-slate-700 px-3 py-1 rounded-full text-sm text-gray-200"
                      >
                        {genre.name}
                      </span>
                    ))}
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


