const mongoose = require('mongoose');
const Movies = mongoose.model('Movie');
const {countMovies} = require('./movies_controller')

const facet = {
    $facet: {
      movies: [
          { $match: { type: 'movie' } },
          { $unwind: '$genres' },
          { $group: { _id: '$genres', count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
      ],
      series: [
         { $match: { type: 'series' } },
         { $unwind: '$genres' },
         { $group: { _id: '$genres', count: { $sum: 1 } } },
         { $sort: { _id: 1 } }
      ]
    }
  };

const setupMenu = async app => {
  try{
const result = await Movies.aggregate([facet]);
// req.session.movieGenres = result[0].movies;
// req.session.serieGenres =result[0].series;
// req.session.movieCount = await countMovies({type: "movie"});
// req.session.serieCount = await countMovies({type: "series"});

app.locals.movieGenres = result[0].movies;
app.locals.serieGenres =result[0].series;
app.locals.movieCount = await countMovies({type: "movie"});
app.locals.serieCount = await countMovies({type: "series"});

// console.log('setupmenu.............................')

}catch(error){
console.error(error);
}
};

module.exports = {setupMenu}