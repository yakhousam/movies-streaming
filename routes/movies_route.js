const router = require('express').Router();
const Movies = require('../controllers/movies_controller');



router.get('/movies', async (req, res, next) => {
  try {
    const movies = await Movies.getMoviesByQuery(req, res);
    res.render('moviesByQuery', {...movies})
  } catch (error) {
    next(error);
  }
});





module.exports = router;
