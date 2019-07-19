const mongoose = require('mongoose');
const Movies = mongoose.model('Movie');

const projection = {
  title: 1,
  year: 1,
  poster: 1,
  'imdb.rating': 1,
  type: 1,
  plot: 1,
  countries: 1,
  genres: 1,
  view: 1
};

const getMostMoviesView = async () => {
  // console.log('getMostMoviesView')
  try {
    const movies = await Movies.find(
      { view: { $exists: true } },
      projection
    ).limit(10);
    // const explain = await Movies.find({ view: { $exists: true } }, projection ).limit(10).explain()
    // console.log(explain)
    return movies;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {getMostMoviesView};
