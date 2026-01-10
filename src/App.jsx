import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Watch from './pages/Watch';
import './styles/index.css';
import Particles from './components/Particles';

/**
 * Main App Component
 * Sets up React Router and defines all routes
 */
function App() {
  return (
    <Router>
      {/* Animated background - fixed and non-interactive */}


      {/* Content - Positioned above background */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Routes>
          {/* Home page - displays trending movies */}
          <Route path="/" element={<Home />} />
          
          {/* Watch page - displays movie/tv player */}
          <Route path="/watch/:type/:id" element={<Watch />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

