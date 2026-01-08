import MovieCard from '../components/MovieCard';

const MovieRow = ({ title, movies }) => {
  if (!movies || movies.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="container mx-auto px-12">
        <h2 className="mb-6 text-2xl font-bold text-white">
          {title}
        </h2>

        {/* Grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {movies.slice(0, 20).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MovieRow;
