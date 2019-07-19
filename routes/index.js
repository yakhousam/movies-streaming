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

router.use(async (req, res, next) => { // TODO midelware is called twice
  // console.log('=================================================================================================')
  if (!req.session.movieGenres || !req.session.serieGenres) {
    await setupMenu(req);
  }
  res.locals.movieGenres = req.session.movieGenres;
  res.locals.serieGenres = req.session.serieGenres;
  res.locals.blackTheme = req.session.blackTheme;
  res.locals.mostMoviesView = await getMostMoviesView();
  // console.log("most viewed =", res.locals.mostMoviesView )
  if(process.env.NODE_ENV === 'production'){
    res.locals.production = true;
  }
  next();
});
router.use(userRoute);
router.use(profile);
router.use(movieByID);
router.use(moviesRoute);
router.use(videoYoutube);
router.use(wikipedia);

router.get('/', async (req, res, next) => {
  try {
    const title = 'MFLIX-yakhousam';
    // const { movies, series } = await getSample();
    // res.render('home', { movies, series, title, index: true });
    const movies = await getSample()
    res.render('home', { movies, title, index: true });
  } catch (error) {
    next(error);
  }
});

router.get('/theme', (req, res, next) => {
  req.session.blackTheme = req.query.blackTheme;
  res.locals.blackTheme = req.query.blackTheme;
  res.redirect(req.header('Referer') || '/')
})

router.use((req, res, next) => {
  res.render('404');
});

router.use((err, req, res, next) => {
  console.error(err);
  res.render('404');
});

module.exports = router;
