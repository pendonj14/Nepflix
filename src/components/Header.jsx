import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { searchMultiMedia } from '../api/tmdb';

/**
 * Header Component
 * Minimal styled header with centered navigation and expandable search
 */
const Header = ({ contentType = 'movie', onContentTypeChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [localContentType, setLocalContentType] = useState(contentType);
  
  // New state for UI animation
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // Update localContentType when on watch page
  useEffect(() => {
    if (location.pathname.includes('/watch/')) {
      // Extract type from URL params if available
      const pathParts = location.pathname.split('/');
      if (pathParts[2] === 'tv' || pathParts[2] === 'movie') {
        setLocalContentType(pathParts[2]);
      }
    }
  }, [location.pathname]);

  // Close search if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        if (searchQuery === '') {
          setIsSearchExpanded(false);
        }
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery]);

  // Debounced search function (Original Logic)
  const handleSearch = async (query) => {
    if (!query || query.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchMultiMedia(query, localContentType);
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleMovieClick = (itemId) => {
    navigate(`/watch/${localContentType}/${itemId}`);
    setSearchQuery('');
    setShowResults(false);
    setIsSearchExpanded(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleMovieClick(searchResults[0].id);
    }
  };

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded) {
      // Focus input slightly after animation starts
      setTimeout(() => document.getElementById('search-input')?.focus(), 100);
    }
  };

  const handleContentTypeChange = (type) => {
    setLocalContentType(type);
    onContentTypeChange?.(type);
  };

  return (
    <header className="fixed top-0 w-full z-50 px-4 md:px-8 py-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent transition-all duration-300">
      <div className="flex items-center justify-between relative">
        
        {/* Left: Logo */}
        <div className="flex-shrink-0 z-20">
          <button
            onClick={() => navigate('/')}
            className="text-3xl font-bold text-[#E50914] hover:scale-105 transition-transform font-bebas tracking-wide shadow-black drop-shadow-md"
          >
            NEPFLIX
          </button>
        </div>

        {/* Center: Navigation Toggles */}
        {/* Uses absolute positioning to stay perfectly centered regardless of side elements */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-8 z-10">
          <button 
            onClick={() => handleContentTypeChange('movie')}
            className={`font-medium text-sm transition-colors uppercase tracking-widest pb-1 ${
              localContentType === 'movie'
                ? 'text-white border-b-2 border-white'
                : 'text-gray-300 hover:text-white hover:border-b-2 border-white/50'
            }`}
          >
            Movies
          </button>
          <button 
            onClick={() => handleContentTypeChange('tv')}
            className={`font-medium text-sm transition-colors uppercase tracking-widest pb-1 ${
              localContentType === 'tv'
                ? 'text-white border-b-2 border-white'
                : 'text-gray-300 hover:text-white hover:border-b-2 border-white/50'
            }`}
          >
            TV Shows
          </button>
        </div>

        {/* Right: Expandable Search */}
        <div className="flex items-center z-20" ref={searchInputRef}>
          <form onSubmit={handleSubmit} className="relative flex items-center justify-end">
            
            {/* Search Icon (Click to Toggle) */}
            <button 
              type="button"
              onClick={toggleSearch}
              className={`p-2 text-white transition-all duration-300 ${isSearchExpanded ? 'opacity-0 invisible absolute' : 'opacity-100 visible'}`}
            >
               <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
            </button>

            {/* Expandable Input Container */}
            <div 
              className={`flex items-center bg-black/60 border border-white/30 backdrop-blur-md rounded-full overflow-hidden transition-all duration-500 ease-in-out ${
                isSearchExpanded ? 'w-64 opacity-100' : 'w-0 opacity-0 border-none'
              }`}
            >
              <div className="pl-3 text-gray-400">
                 {isSearching ? (
                   <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                 ) : (
                   <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                   </svg>
                 )}
              </div>
              
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={() => { if (searchResults.length > 0) setShowResults(true); }}
                placeholder="Titles, people, genres"
                className="w-full bg-transparent text-white text-sm px-3 py-2 focus:outline-none placeholder-gray-400"
              />
              
              {/* Close/Clear Button */}
              {searchQuery && (
                 <button 
                   type="button" 
                   onClick={() => setSearchQuery('')}
                   className="pr-3 text-gray-400 hover:text-white"
                 >
                   ✕
                 </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full right-0 mt-4 w-80 max-h-96 overflow-y-auto bg-neutral-900/95 border border-white/10 rounded-lg shadow-2xl backdrop-blur-md scrollbar-thin scrollbar-thumb-gray-600">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMovieClick(item.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-none"
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                      alt={item.title || item.name}
                      className="w-12 h-16 object-cover rounded shadow-md"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/92x138?text=No+Image';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-sm font-medium truncate">{item.title || item.name}</h3>
                      {(item.release_date || item.first_air_date) && (
                        <p className="text-gray-400 text-xs mt-1">
                          {new Date(item.release_date || item.first_air_date).getFullYear()}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>
      </div>
    </header>
  );
};

export default Header;