const movieList = (z, bundle) => {
  return z
    .request('http://example.com/movies.json')
    .then(res => z.JSON.parse(res.content))
    .then(movies => {
      return movies.map(movie => {
        const imageUrl = `http://example.com/movie-images/${movie.id}.jpg`;
        const requestOptions = {
          params: {
            size: 'small'
          }
        };
        movie.poster = z.dehydrateFile(imageUrl, requestOptions, {
          contentType: 'image/jpeg'
        });
        return movie;
      });
    });
};

const App = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  triggers: {
    new_movie: {
      noun: 'Movie',
      display: {
        label: 'New Movie',
        description: 'Triggers when a new Movie is added.'
      },
      operation: {
        perform: movieList
      }
    }
  }
};

module.exports = App;
