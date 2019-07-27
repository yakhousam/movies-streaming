const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Comments = mongoose.model('Comment')

const router = express.Router();

router.use((req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.username = req.user.local.username || req.user.social.github.username || req.user.social.twitter.username || req.user.social.google.username;
    res.locals.userPhoto = req.user.social.github.photo || req.user.social.twitter.photo || req.user.social.google.photo;
    res.locals.authenticated = req.isAuthenticated();
  }
  
  // console.log('isAuthenticated', req.isAuthenticated());
  res.locals.error = req.flash('error');
  res.locals.passwordError = req.flash('passwordError');
  res.locals.usernameError = req.flash('usernameError');
  // console.log('returnTo =', req.session.returnTo);
  // console.log('session cookie', req.session.cookie)
  next();
});
router
  .route('/login')
  .get((req, res) => {
    // console.log('redirect', req.header('Referer') || '/');
    if (!/login|register/i.test(req.header('Referer'))) {
      req.session.redirectTo = req.header('Referer') || '/';
    }
    res.render('login', { title: 'Login' });
  })
  .post(
    passport.authenticate('local', {
      failureRedirect: '/login',
      // successRedirect: '/',
      failureFlash: true
    }),
    (req, res) => {
      res.redirect(req.session.redirectTo);
    }
  );

router
  .route('/register')
  .get((req, res) => {
    if (!/login|register/i.test(req.header('Referer'))) {
      req.session.redirectTo = req.header('Referer') || '/';
    }
    res.render('register', { title: 'Sign up' });
  })
  .post(
    (req, res, next) => {
      User.findOne({ "local.username": req.body.username }, (err, user) => {
        if (err) return next(err);
        if (user) {
          req.flash('usernameError', 'Username already used');
          return res.redirect('/register');
        }
        const newUser = new User({
          local:{username: req.body.username,
          password: req.body.password}
        });
        newUser.save(function(err) {
          if (err) {
            const usernameError = err.errors.username
              ? err.errors.username.message
              : '';
            const passwordError = err.errors.password
              ? err.errors.password.message
              : '';

            req.flash('passwordError', passwordError);
            req.flash('usernameError', usernameError);
            res.redirect('/register');
          } else {
            next();
          }
        });
      });
    },
    passport.authenticate('local', {
      failureRedirect: '/login',
      // successRedirect: '/',
      failureFlash: true
    }),
    (req, res) => {
      res.redirect(req.session.redirectTo);
    }
  );

// github login
router.get('/auth/github',
  passport.authenticate('github'));

router.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect(req.session.redirectTo || '/');
  });

// twitter login
router.get('/auth/twitter',
  passport.authenticate('twitter'));

router.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect(req.session.redirectTo || '/');
  });

// google login
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect(req.session.redirectTo || '/');
  });



router.get('/accountDelete',  async (req, res) =>{
  if(!req.isAuthenticated()){
    res.redirect('/login')
  }
  const id = req.user._id;
  await User.findByIdAndDelete(id);
  await Comments.deleteMany({commentedBy:id})
  res.redirect('/');
})

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
