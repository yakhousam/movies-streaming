require('dotenv').config();
require('./model/db');
const express = require('express');
const route = require('./routes');
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);
const passport = require('passport')
const flash = require('connect-flash')
const auth = require('./auth')
const helmet = require('helmet')

const app = express();

app.use(helmet())

auth();

const store =  new MongoDBStore({
  uri: process.env.NODE_ENV === 'production' ? process.env.dbUri : 'mongodb://localhost/movies',
  collection:'session'
})
app.use(
  session({
    secret: 'kldskfmqkdlsmfqm',
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7 
    },
    resave: false,
    saveUninitialized: true,
   store
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use('/static', express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(flash());

app.set('view engine', 'pug');
app.set('views', 'views');

app.use(route);


app.listen(process.env.PORT || 3000, () => {
  console.log('Server started at http://localhost:3000');
});
