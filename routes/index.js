const router = require('express').Router();
const { getSample } = require('../controllers/movies_controller');
// const { setupMenu } = require('../controllers/menu_controller');
const { getMostMoviesView } = require('../controllers/aside_controller');
const movieByID = require('./movieByID_route');
const moviesRoute = require('./movies_route');
const userRoute = require('./user_route');
const profile = require('./user_profile_route')
const videoYoutube = require('./video_youtube');
const wikipedia = require('./wikipedia_route');


router.use('/favicon.ico', (req, res, next) =>{
  // console.log('favicon')
  return res.sendFile(process.cwd() + '/public/images/favicon2.ico' )
});

router.get('/theme', (req, res, next) => {
  req.session.blackTheme = req.query.blackTheme;
  res.locals.blackTheme = req.query.blackTheme;
  return res.redirect(req.header('Referer') || '/')
})
router.use(videoYoutube);
router.use(wikipedia);

router.use(async(req, res, next) => { // TODO midelware is called twice
  //  console.log('=============================================================')
  //  console.log('path =', req.path)
  //  console.log('=============================================================')
  //  console.log("req.session =", req.session)
  // if (!req.session.movieGenres || !req.session.serieGenres) {
  //   await setupMenu(req);
  // }
  // res.locals.movieGenres = req.session.movieGenres;
  // res.locals.serieGenres = req.session.serieGenres;
  // res.locals.movieCount = req.session.movieCount;
  // res.locals.serieCount = req.session.serieCount;
  req.app.locals.audience++;
  res.locals.blackTheme = req.session.blackTheme;
  await getMostMoviesView(res);
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



router.use((req, res, next) => {
  res.render('404');
});

router.use((err, req, res, next) => {
  console.error(err);
  res.render('404');
});

module.exports = router;
