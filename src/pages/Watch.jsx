import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchTrendingMovies, fetchTrendingShows, getPosterUrl, fetchTVShowDetails, fetchSeasonDetails, getStillUrl} from '../api/tmdb';
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

        if (type === 'anime' || type === 'tv') {
          // Fetch TV show/anime details
          foundContent = await fetchTVShowDetails(id);
          setContent(foundContent);
          
          // Set up seasons
          if (foundContent.seasons) {
            // TV shows and anime have seasons
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
      return `https://player.videasy.net/tv/${id}/${selectedSeason}/${selectedEpisode}?nextEpisode=true&autoplayNextEpisode=true&color=ffc30e`;
    } else {
      // For movies: movie/{id}
      return `https://player.videasy.net/movie/${id}?color=ffc30e`;
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
      <main className="container mx-auto px-4 py-8 ">
        <div className="mx-auto max-w-7xl">
          {/* Videasy iframe player */}
          <div
        className="
          relative w-full bg-black shadow-2xl overflow-hidden
          h-[100svh] sm:h-auto
          sm:aspect-video
          rounded-none sm:rounded-lg
        "
      >
        <iframe
          key={videasyUrl}
          src={videasyUrl}
          className="absolute inset-0 h-full w-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title={title}
        />
      </div>

          {/* TV Show Controls */}
          {(type === 'tv' || type === 'anime') && seasons.length > 0 && (
            <div className="mt-6 rounded-lg bg-black  p-6">
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
                  <h3 className="mb-4 text-lg font-semibold text-white">
                    Episodes
                  </h3>

                  <div className="
                    grid gap-4
                    grid-cols-1
                    sm:grid-cols-2
                    lg:grid-cols-3
                    xl:grid-cols-4
                    max-h-[32rem]
                    overflow-y-auto
                    no-scrollbar
                    px-4
                    pt-2
                  ">
                    {episodes.map((episode) => (
                      <div
                        key={episode.episode_number}
                        onClick={() => setSelectedEpisode(episode.episode_number)}
                        className={`
                          group cursor-pointer overflow-hidden rounded-lg
                          bg-slate-900 transition-all duration-300
                          hover:scale-[1.02] hover:bg-slate-600
                          ${selectedEpisode === episode.episode_number
                            ? 'ring-2 ring-[#ffc30e]'
                            : ''
                          }
                        `}
                      >
                        {/* Episode Image */}
                        <div className="relative aspect-video overflow-hidden bg-black">
                          <img
                            src={getStillUrl(episode.still_path)} 
                            alt={episode.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            loading="lazy"
                          />

                            <h4 className=" absolute bottom-2 line-clamp-1 font-semibold text-white px-2">
                              {episode.name}
                            </h4>
                            {/* Episode number overlay */}
                            <div className="absolute top-2 left-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                              EP {episode.episode_number}
                            </div>
                          </div>
                        </div>

                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          
        </div>
      </main>
    </div>
  );
};

export default Watch;


