require('./model/db')
const mongoose = require('mongoose')
const Movies = mongoose.model('Movie')

const getSample = async () => {
  const size = 1;
  const projection = {
    title: 1,
    year: 1,
    poster: 1,
    'imdb.rating': 1,
    type: 1
  };
  const facet = {
   // $facet: {
      movies: [
        { $match: { type: 'movie', poster: { $ne: null } } },
        { $sample: { size } },
        { $project: projection }
      ],
      series: [
        { $match: { type: 'series', poster: { $ne: null } } },
        { $sample: { size } },
        { $project: projection }
      ],
      moviesCount: [{ $match: { type: 'movie' } }, { $count: 'count' }],
      seriesCount: [{ $match: { type: 'series' } }, { $count: 'count' }]
    //}
  };
  try {
    const projection = {movies:1, series:1, moviesCount: '$moviesCount.count', seriesCount: '$seriesCount.count'}
    const result = await Movies.aggregate().facet(facet).project(projection);
    
    return result;
    const samples = { ...result[0] };
    const params = [
      {
        movies: samples.movies,
        count: samples.moviesCount[0].count,
        title: 'Movies',
        showAll: true,
        type: 'movie'
      },
      {
        movies: samples.series,
        count: samples.seriesCount[0].count,
        title: 'Series',
        showAll: true,
        type: 'series'
      }
    ];

    return params;
  } catch (error) {}
};

const countMovies = async()=>{
const count = await Movies.aggregate()
  .match({ type: 'movie' })
  .count('countMovies');
  return count
} 

//const x = getSample()
const x = countMovies()
x.then(docs =>{
//const doc = {...docs}
  console.log(docs)
  process.exit(0);
})