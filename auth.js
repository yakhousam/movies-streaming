const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoose = require('mongoose')
const User = mongoose.model('User')


passport.use(
  new LocalStrategy(function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      user.checkPassword(password, function(err, isMatch) {
        if (err) return done(null, false);
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Invalid password.' });
        }
      });
    });
  })
);

module.exports = function() {
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      if (err) return done(err);
      done(null, user);
    });
  });
};
