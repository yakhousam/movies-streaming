const mongoose = require('mongoose');
const Movies = mongoose.model('Movie');
const { getPages, formatQuery } = require('./utils');


const countMovies = async filter => {
  const count = await Movies.countDocuments(filter);
  return count;
};
/*---------------------------------------
        home getsample 
-----------------------------------------*/

const getSample = async () => {
  const projection = {
    title: 1,
    year: 1,
    poster: 1,
    'imdb.rating': 1,
    type: 1,
    plot: 1,
    countries: 1,
    genres: 1
  };
  const size = 30;
  const facet = {
    $facet: {
      movies: [
        { $match: { type: 'movie', poster: { $ne: null } } },
        { $sample: { size } },
        { $project: projection }
      ],
      series: [
        { $match: { type: 'series', poster: { $ne: null } } },
        { $sample: { size } },
        { $project: projection }
      ]
    }
  };
  try {
    const samples = await Movies.aggregate([facet]);
    return samples[0];
  } catch (error) {
    console.error(error)
  }
};
/********************************** */

const getMovies = async ({
  filter = {},
  project,
  limit = 30,
  skip = 0,
  sort = { title: 1 }
}) => {
  try {
    const matchStage = { $match: filter };
    const sortStage = { $sort: sort };
    const skipStage = { $skip: skip };
    const limitStage = { $limit: limit };
    const pipeline = [matchStage , sortStage, skipStage, limitStage];
    if (project) {
      pipeline.push({ $project: project });
    }
    console.log('pipeline=', pipeline)
    const movies = await Movies.aggregate(pipeline).collation({locale: 'fr', numericOrdering: true});
    // console.log('movies = ', movies)
    return movies.filter(
      //remove duplicate document
      (mv, i, arr) =>
        arr.findIndex(
          x =>
            x.title === mv.title && x.year === mv.year && mv.poster === x.poster
        ) === i
    );
  } catch (error) {
    console.error(error);
  }
};

/*-------------------------------------------
        Movies by query
--------------------------------------------*/

const getMoviesByQuery = async (req, res) => {
  const projection = {
    title: 1,
    year: 1,
    poster: 1,
    'imdb.rating': 1,
    type: 1,
    plot: 1,
    countries: 1,
    genres: 1
  };
  try {
    const query = formatQuery(req, res);
    const { page, sort, filter, url } = query;
    if (url) {
      req.url = url;
    }
    if (query.score) {
      projection.score = query.score;
    }
    
    const currentPage = +page || 0;
    const limit = 60;
    const skip = currentPage * limit;
    let movies;
    if(sort.title){
      console.log('use collation')
      movies = await Movies.find(filter,projection).sort(sort).skip(skip).limit(limit).collation({locale:'fr', strength: 2});
      const explain = await Movies.find(filter,projection).sort(sort).skip(skip).limit(limit).collation({locale:'fr', strength: 2}).explain();
      console.log(explain)
    }else{
      console.log('no collation used')
      movies = await Movies.find(filter,projection).sort(sort).skip(skip).limit(limit);
    }
    
    if (movies.length === 0) {
      return { movies: [], title: 'Not Found' };
    }
    const count = await countMovies(filter);
    let movieType = movies[0].type;
    movieType = movieType.endsWith('s') ? movieType : movieType + 's';
    const genresTile = filter.genres && `${movieType}-${filter.genres}`;
    const pageTitle =
      query.search ||
      filter.cast ||
      genresTile ||
      filter.directors ||
      movieType;
    req.session.people =
      (!query.search && filter.cast) ||
      (!query.search && filter.directors) ||
      (filter.writers && query.search) || undefined; //for wikipedia
    return {
      movies,
      type: movieType,
      title: pageTitle,
      pages: getPages(currentPage, count, limit) || [],
      route: req.url,
      currentPage,
      people: req.session.people
    };
  } catch (error) {
    console.log(error);
  }
};

/*-------------------------------------------
              View Movie by ID
-------------------------------------------*/
const getMovieById = async id => {
  try {
    const movie = await Movies.findByIdAndUpdate(
      id,
      { $inc: { view: 1 } },
      { useFindAndModify: false }
    );
    return movie;
  } catch (error) {
    console.error(error);
  }
};

/****************************************** */



/*==============
    exports
===============*/    
module.exports = {
  getSample,
  getMovies,
  getMoviesByQuery,
  getMovieById
};
