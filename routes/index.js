const router = require('express').Router();
const { getSample } = require('../controllers/movies_controller');
const { setupMenu } = require('../controllers/menu_controller');
const { getMostMoviesView } = require('../controllers/aside_controller');
const movieByID = require('./movieByID_route');
const moviesRoute = require('./movies_route');
const userRoute = require('./user_route');
const profile = require('./user_profile_route')
const videoYoutube = require('./video_youtube');
const wikipedia = require('./wikipedia_route');

router.use(async (req, res, next) => {
  if (!req.session.movieGenres || !req.session.serieGenres) {
    await setupMenu(req);
  }
  res.locals.movieGenres = req.session.movieGenres;
  res.locals.serieGenres = req.session.serieGenres;
  res.locals.movieCount = req.session.movieCount;
  res.locals.serieCount = req.session.serieCount;
  res.locals.mostMoviesView = await getMostMoviesView();
  if(res.locals.sort){
    console.log('res sort =', req.locals.sort)
  }
  next();
});

router.use(userRoute);
router.use(profile);
router.use(movieByID, moviesRoute);
// router.use(moviesRoute);
router.use(videoYoutube);
router.use(wikipedia);

router.get('/', async (req, res, next) => {
  try {
    const title = 'MFLIX-yakhousam';
    const { movies, series } = await getSample();
    res.render('home', { movies, series, title, index: true });
  } catch (error) {
    next(error);
  }
});

router.use((req, res, next) => {
  res.render('404');
});

router.use((err, req, res, next) => {
  console.error(err);
  res.render('404');
});

module.exports = router;
