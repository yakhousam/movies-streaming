const passport = require('passport');
const LocalStrategy = require('passport-local');
const GitHubStrategy = require('passport-github').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose')
const User = mongoose.model('User')

// local strategy
passport.use(
  new LocalStrategy(function(username, password, done) {
    User.findOne({ "local.username": username }, function(err, user) {
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

// github strategy
passport.use(new GitHubStrategy({
  // clientID: process.env.GITHUB_CLIENT_ID,
  // clientSecret: process.env.GITHUB_CLIENT_SECRET,
  // callbackURL: "https://mflix-yakhousam.herokuapp.com/auth/github/callback"
  clientID: "c6aba0891770c9b3a301",
  clientSecret: "fe4b968282566b640b58a788aab75ae67da4c978",
  callbackURL: "http://127.0.0.1:3000/auth/github/callback"

},
function(accessToken, refreshToken, profile, cb) {
  const update = {
    social: { github: { 
      id: profile.id, 
      username: profile.username,
      photo: profile.photos[0].value 
    } }
  };
  User.findOneAndUpdate({ "social.github.id": profile.id},update , { upsert: true , new: true,  useFindAndModify: false }, function (err, user) {
    return cb(err, user);
  });
}
));

// twitter strategy
passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: "https://mflix-yakhousam.herokuapp.com/auth/twitter/callback"
},
function(token, tokenSecret, profile, cb) {
  // console.log('twitter profile =', profile)
  const update = {
    social: { twitter: { 
      id: profile.id, 
      username: profile.username,
      photo: profile.photos[0].value 
    } }
  };
  User.findOneAndUpdate({ "social.twitter.id": profile.id},update , { upsert: true , new: true,  useFindAndModify: false }, function (err, user) {
    return cb(err, user);
  });
}
));

// google strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://mflix-yakhousam.herokuapp.com/auth/google/callback"
},
function(accessToken, refreshToken, profile, cb) {
  // console.log('gogole profile =', profile)
  const update = {
    social: { google: { 
      id: profile.id, 
      username: profile.displayName,
      photo: profile.photos[0].value 
    } }
  };
  User.findOneAndUpdate({ "social.google.id": profile.id},update , { upsert: true , new: true,  useFindAndModify: false }, function (err, user) {
    return cb(err, user);
  });
}
));

module.exports = function() {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      if (err) return done(err);
      done(null, user);
    });
  });
};
