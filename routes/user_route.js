const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const route = express.Router();

route.use((req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.username = req.user.username;
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
route
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

route
  .route('/register')
  .get((req, res) => {
    if (!/login|register/i.test(req.header('Referer'))) {
      req.session.redirectTo = req.header('Referer') || '/';
    }
    res.render('register', { title: 'Sign up' });
  })
  .post(
    (req, res, next) => {
      User.findOne({ username: req.body.username }, (err, user) => {
        if (err) return next(err);
        if (user) {
          req.flash('usernameError', 'Username already used');
          return res.redirect('/register');
        }
        const newUser = new User({
          username: req.body.username,
          password: req.body.password
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

route.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = route;
