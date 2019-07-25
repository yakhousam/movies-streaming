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

const setupMenu = async req => {
  try{
const result = await Movies.aggregate([facet]);
req.session.movieGenres = result[0].movies;
req.session.serieGenres =result[0].series;
req.session.movieCount = await countMovies({type: "movie"});
req.session.serieCount = await countMovies({type: "series"});
}catch(error){
console.error(error);
}
};

module.exports = {setupMenu}