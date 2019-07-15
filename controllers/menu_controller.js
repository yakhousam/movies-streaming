const mongoose = require('mongoose');
const Movies = mongoose.model('Movie');

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
// req.session.movieCount = result[0].moviesCount[0].count;
// req.session.serieCount = result[0].seriesCount[0].count;
}catch(error){
console.error(error);
}
};

module.exports = {setupMenu}