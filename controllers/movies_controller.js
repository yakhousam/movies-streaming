const mongoose = require('mongoose');
const Movies = mongoose.model('Movie');
const { getPages, formatQuery } = require('./utils');

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

/*---------------------------------------
        count movies or series 
-----------------------------------------*/

const countMovies = async filter => {
  const count = await Movies.countDocuments(filter);
  return count;
};
/*---------------------------------------
        home getsample 
-----------------------------------------*/

const getSample = async () => {
  const project = {...projection}
  // const size = 30;
  // const facet = {
  //   $facet: {
  //     movies: [
  //       { $match: { type: 'movie', poster: { $ne: null } } },
  //       { $sample: { size } },
  //       { $project: project }
  //     ],
  //     series: [
  //       { $match: { type: 'series', poster: { $ne: null } } },
  //       { $sample: { size } },
  //       { $project: project }
  //     ]
  //   }
  // };
  try {
    // const samples = await Movies.aggregate([facet]);
    const samples = await Movies.aggregate([{$sample:{size:100}}, { $match: { poster: { $ne: null } } }, {$limit: 60}, {$project: project}]);
    // console.log(samples)
    return samples;
  } catch (error) {
    console.error(error)
  }
};
/********************************** */



/*-------------------------------------------
        Movies by query
--------------------------------------------*/

const getMoviesByQuery = async (req, res) => {
  const project = {...projection}
  try {
    const query = formatQuery(req, res);
    const { page = 0, sort, filter, url } = query;
    if (url) {
      req.url = url;
    }
    if (query.score) {
      project.score = query.score;
    }
    
    const currentPage = +page;
    const limit = 60;
    const skip = currentPage * limit;
    console.log('filter=', filter)
    let movies;
    if(sort.title){
      movies = await Movies.find(filter,project).sort(sort).skip(skip).limit(limit).collation({locale:'fr', strength: 2});
      const explain = await Movies.find(filter,project).sort(sort).skip(skip).limit(limit).collation({locale:'fr', strength: 2}).explain();
      console.log("Movies by query explain use collation", explain)
    }else{
      movies = await Movies.find(filter,project).sort(sort).skip(skip).limit(limit);
      const explain = await Movies.find(filter,project).sort(sort).skip(skip).limit(limit).explain();
      console.log("Movies by query explain no collation", explain)
    }
    movies = movies.filter(
      //remove duplicate document
      (mv, i, arr) =>
        arr.findIndex(
          x =>
            x.title === mv.title &&
            x.year === mv.year &&
            mv.poster === x.poster
        ) === i
    );
    res.locals.sort = sort;
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
    return {
      movies,
      type: movieType,
      title: 'MFLIX-yakhousam: ' + pageTitle,
      headerTitle: pageTitle,
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
    const movie = await Movies.findByIdAndUpdate(id,{ $inc: { view: 1 } }, { useFindAndModify: false });
    // console.log('getMovieByID =', movie)
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
  // getMovies,
  getMoviesByQuery,
  getMovieById
};
